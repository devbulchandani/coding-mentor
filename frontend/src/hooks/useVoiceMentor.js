import { useState, useRef, useCallback } from 'react';
import { floatTo16BitPCM, pcm16ToBase64, base64ToPcm16 } from '../utils/audioUtils';

export function useVoiceMentor(planId, milestoneId) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    
    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    
    const playQueueRef = useRef(Promise.resolve());

    const startCall = async () => {
        setIsConnecting(true);
        try {
            const res = await fetch(`http://localhost:8080/api/plans/${planId}/voice/session/${milestoneId}`);
            if (!res.ok) throw new Error("Failed to fetch session");
            const sessionData = await res.json();

            const wsUrl = `wss://${sessionData.location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent?access_token=${sessionData.accessToken}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                const setupMessage = {
                    setup: {
                        model: `projects/${sessionData.projectId}/locations/${sessionData.location}/publishers/google/models/${sessionData.modelName}`,
                        systemInstruction: {
                            parts: [{ text: sessionData.systemInstruction }]
                        }
                    }
                };
                ws.send(JSON.stringify(setupMessage));
                
                // 4. Start Microphone Capture
                startMicrophone();
                setIsConnected(true);
                setIsConnecting(false);
            };

            ws.onmessage = (event) => handleIncomingMessage(event);
            
            ws.onclose = () => endCall();
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
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        // Using ScriptProcessorNode for wide browser compatibility without needing separate worker files
        processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        processorRef.current.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            
            // Get raw audio, convert to PCM16, encode to Base64
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(inputData);
            const base64Audio = pcm16ToBase64(pcm16);

            // Send to Gemini
            const audioMessage = {
                clientContent: {
                    turns: [{
                        role: "user",
                        parts: [{ inlineData: { mimeType: "audio/pcm;rate=16000", data: base64Audio } }]
                    }],
                    turnComplete: true
                }
            };
            wsRef.current.send(JSON.stringify(audioMessage));
        };

        source.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);
    };

    const handleIncomingMessage = (event) => {
        const data = JSON.parse(event.data);
        
        // 1. Handle incoming Audio from AI
        if (data.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
            const base64Audio = data.serverContent.modelTurn.parts[0].inlineData.data;
            playAudio(base64Audio);
        }

        // 2. Handle Interruption (Barge-in detection)
        if (data.serverContent?.interrupted) {
            console.log("User interrupted the AI!");
            // Reset the playback queue to stop current audio
            playQueueRef.current = Promise.resolve(); 
        }
    };

    const playAudio = useCallback((base64Audio) => {
        playQueueRef.current = playQueueRef.current.then(() => new Promise((resolve) => {
            if (!audioContextRef.current) return resolve();

            const pcm16 = base64ToPcm16(base64Audio);
            // Convert PCM16 back to Float32 for playback
            const floatArray = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
                floatArray[i] = pcm16[i] / 32768.0;
            }

            const buffer = audioContextRef.current.createBuffer(1, floatArray.length, 24000); // Gemini returns 24kHz audio
            buffer.getChannelData(0).set(floatArray);

            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = resolve;
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