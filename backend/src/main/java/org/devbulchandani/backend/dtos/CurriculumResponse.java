package org.devbulchandani.backend.dtos;

import lombok.*;

import java.util.List;

public record CurriculumResponse (
        String projectName,
        String projectDescription,
        List<MilestoneDto> milestones
) {}
