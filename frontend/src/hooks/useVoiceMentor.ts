import { useState, useRef, useCallback } from 'react';
import { floatTo16BitPCM, pcm16ToBase64, base64ToPcm16 } from '../utils/audioUtils';

interface VoiceSessionResponse {
    location: string;
    accessToken: string;
    projectId: string;
    modelName: string;
    systemInstruction: string;
}

interface WebSocketMessage {
    setup?: {
        model: string;
        systemInstruction: {
            parts: Array<{ text: string }>;
        };
        generationConfig: {
            responseModalities: string[];
        };
    };
    clientContent?: {
        turns: Array<{
            role: string;
            parts: Array<{ inlineData: { mimeType: string; data: string } }>;
        }>;
        turnComplete: boolean;
    };
    serverContent?: {
        modelTurn?: {
            parts?: Array<{ inlineData?: { data: string } }>;
        };
        interrupted?: boolean;
    };
}

export function useVoiceMentor(planId: string | undefined, milestoneId: number | undefined) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);

    const playQueueRef = useRef<Promise<void>>(Promise.resolve());

    const startCall = async () => {
        if (!planId || !milestoneId) {
            console.error('Plan ID or Milestone ID is missing');
            return;
        }

        setIsConnecting(true);
        try {
            const res = await fetch(`http://localhost:8080/api/plans/${planId}/voice/session/${milestoneId}`);
            if (!res.ok) throw new Error("Failed to fetch session");
            const sessionData: VoiceSessionResponse = await res.json();

            const wsUrl = `wss://${sessionData.location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent?access_token=${sessionData.accessToken}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                const setupMessage: WebSocketMessage = {
                    setup: {
                        model: `projects/${sessionData.projectId}/locations/${sessionData.location}/publishers/google/models/${sessionData.modelName}`,
                        systemInstruction: {
                            parts: [{ text: sessionData.systemInstruction }]
                        },
                        generationConfig: {
                            responseModalities: ["AUDIO"]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMessage));

                // Start Microphone Capture
                startMicrophone();
                setIsConnected(true);
                setIsConnecting(false);
            };

            ws.onmessage = async (event) => {
                try {
                    let textData = event.data;
                    if (textData instanceof Blob) {
                        textData = await textData.text();
                    }

                    const data = JSON.parse(textData);
                    handleIncomingMessage(data);
                } catch (e) {
                    console.error("Error parsing incoming message:", e);
                }
            };

            ws.onclose = (event) => {
                console.error(`WebSocket Closed immediately! Code: ${event.code}, Reason: ${event.reason}`);
                endCall();
            };
            ws.onerror = (err) => {
                console.error("WebSocket Error:", err);
                endCall();
            };

        } catch (error) {
            console.error("Failed to start call:", error);
            setIsConnecting(false);
        }
    };

    const startMicrophone = async () => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorRef.current.onaudioprocess = (e: AudioProcessingEvent) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(inputData);
            const base64Audio = pcm16ToBase64(pcm16);

            const audioMessage = {
                realtimeInput: {
                    mediaChunks: [{
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Audio
                    }]
                }
            };
            wsRef.current!.send(JSON.stringify(audioMessage));
        };

        source.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
    };

    const handleIncomingMessage = (data: WebSocketMessage) => {
        console.log("Received from Gemini:", data);
        if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
            const base64Audio = data.serverContent.modelTurn.parts[0].inlineData.data;
            playAudio(base64Audio);
        }

        if (data.serverContent?.interrupted) {
            console.log("User interrupted the AI!");
            playQueueRef.current = Promise.resolve();
        }
    };

    const playAudio = useCallback((base64Audio: string) => {
        playQueueRef.current = playQueueRef.current.then(() => new Promise<void>((resolve) => {
            if (!audioContextRef.current) return resolve();

            const pcm16 = base64ToPcm16(base64Audio);
            const floatArray = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
                floatArray[i] = pcm16[i] / 32768.0;
            }

            const buffer = audioContextRef.current.createBuffer(1, floatArray.length, 24000);
            buffer.getChannelData(0).set(floatArray);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => resolve();
            source.start(0);
        }));
    }, []);

    const endCall = () => {
        if (wsRef.current) wsRef.current.close();
        if (processorRef.current) processorRef.current.disconnect();
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();

        setIsConnected(false);
        setIsConnecting(false);
    };

    return { startCall, endCall, isConnected, isConnecting };
}
