package org.devbulchandani.backend.dtos;

public record PlanRequest(
        String technology,
        int duration,
        String skillLevel
) {}
