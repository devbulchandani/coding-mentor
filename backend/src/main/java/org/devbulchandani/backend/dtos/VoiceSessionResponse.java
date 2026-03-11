package org.devbulchandani.backend.dtos;

public record VoiceSessionResponse(
        String accessToken,
        String systemInstruction,
        String projectId,
        String location,
        String modelName
) {}