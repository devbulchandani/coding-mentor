package org.devbulchandani.backend.dtos;

import java.util.Map;

public record VerifyRequest(
        String repoUrl,
        Map<String, String> files
) {}
