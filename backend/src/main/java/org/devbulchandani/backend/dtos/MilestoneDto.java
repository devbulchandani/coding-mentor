package org.devbulchandani.backend.dtos;

public record MilestoneDto (
    int sequenceNumber,
    String title,
    String description,
    String learningObjectives
){}
