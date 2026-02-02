package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.PlanRequest;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.services.CurriculumGeneratorService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plans")
public class CurriculumGeneratorController {
    private final CurriculumGeneratorService service;

    public CurriculumGeneratorController(CurriculumGeneratorService service) {
        this.service = service;
    }

    @Value("${gemini.api.key:${GEMINI_API_KEY}}")
    private String key;

    @GetMapping("/debug-key")
    public String debug(){
        return key;
    }

    @PostMapping
    public LearningPlan createPlan(@RequestBody PlanRequest request) {
        return service.generatePlan(
                request.technology(),
                request.duration(),
                request.skillLevel()
        );
    }
}
