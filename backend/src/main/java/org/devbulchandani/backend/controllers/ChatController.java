package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.ChatRequest;
import org.devbulchandani.backend.bots.MentorBot;
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
        
        // Use repoUrl from request, fallback to database if not provided
        String repoUrl = (req.repoUrl() != null && !req.repoUrl().trim().isEmpty()) 
                ? req.repoUrl() 
                : plan.getGithubUrl();
        
        // Build the enriched prompt
        String enrichedPrompt;
        
        if (repoUrl == null || repoUrl.trim().isEmpty()) {
            // No repository URL available
            enrichedPrompt = """
            USER QUESTION:
            %s

            IMPORTANT INSTRUCTIONS TO YOU (AI):
            - The user has NOT provided a GitHub repository URL yet.
            - You can still provide general guidance and answer conceptual questions.
            - Suggest that they add their repository URL in the settings for code-specific analysis.
            - Answer in a Socratic way (ask guiding questions, do NOT give full code).

            === LEARNING CONTEXT ===
            %s
            """.formatted(
                        req.message(),
                        planContext.buildPlanContext(plan)
                );
        } else {
            // Repository URL is available
            enrichedPrompt = """
            USER QUESTION:
            %s

            GITHUB REPOSITORY URL:
            %s

            IMPORTANT INSTRUCTIONS TO YOU (AI):
            - Use the GitHub repository URL above with your MCP tools to analyze the code.
            - Available MCP tools: analyze_project, read_file, read_files
            - All these tools require the 'repoUrl' parameter - use the URL provided above.
            - Read the project files you need to understand the user's code.
            - Then answer in a Socratic way (ask guiding questions, do NOT give full code).
            - Reference specific files and code you found in the repository.

            === LEARNING CONTEXT ===
            %s
            """.formatted(
                        req.message(),
                        repoUrl,
                        planContext.buildPlanContext(plan)
                );
        }
        
        return mentorBot.chat(enrichedPrompt);
    }

}
