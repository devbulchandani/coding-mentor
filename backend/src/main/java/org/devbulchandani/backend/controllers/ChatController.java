package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.ChatRequest;
import org.devbulchandani.backend.dtos.MentorBot;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.services.LearningContextService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")

public class ChatController {

    private final MentorBot mentorBot;
    private final LearningPlanRepository planRepo;
    private final LearningContextService planContext;

    public ChatController(MentorBot mentorBot, LearningPlanRepository planRepo, LearningContextService planContext) {
        this.mentorBot = mentorBot;
        this.planRepo = planRepo;
        this.planContext = planContext;
    }


    @PostMapping
    public String chat(@RequestBody ChatRequest req) {
        LearningPlan plan = planRepo.findById(req.learningPlanId())
                .orElseThrow(() -> new RuntimeException("Learning plan not found"));



        String enrichedPrompt = """
        USER QUESTION:
        %s

        GITHUB REPO:
        %s

        IMPORTANT INSTRUCTIONS TO YOU (AI):
        - Before analyzing code, use the repo above with your MCP tools.
        - Read the project files you need.
        - Then answer in a Socratic way (ask guiding questions, do NOT give full code).

        === LEARNING CONTEXT ===
        %s
        """.formatted(
                    req.message(),
                    req.repoUrl(),
                    planContext.buildPlanContext(plan)
            );
        return mentorBot.chat(enrichedPrompt);
    }

}
