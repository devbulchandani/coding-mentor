package org.devbulchandani.backend.services;

import com.google.auth.oauth2.GoogleCredentials;
import org.devbulchandani.backend.dtos.VoiceSessionResponse;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class VoiceSessionService {
    private final MilestoneRepository milestoneRepo;
    private final LearningPlanRepository planRepo;
    private final MilestoneContextService milestoneContext;
    private final LearningContextService planContext;

    public VoiceSessionService(MilestoneRepository milestoneRepo, LearningPlanRepository planRepo, MilestoneContextService milestoneContext, LearningContextService planContext) {
        this.milestoneRepo = milestoneRepo;
        this.planRepo = planRepo;
        this.milestoneContext = milestoneContext;
        this.planContext = planContext;
    }

    public VoiceSessionResponse createVoiceSession(Long planId, Long milestoneId) {
        LearningPlan plan = planRepo.findById(planId).orElseThrow();
        Milestone milestone = milestoneRepo.findById(milestoneId).orElseThrow();

        // 1. Build the massive system prompt so Gemini knows exactly what to talk about
        String systemInstruction = """
                You are Buildpace AI, an expert Socratic coding mentor speaking via a live voice call.
                Speak naturally, concisely, and conversationally. Do not speak in Markdown formatting.
                
                === PROJECT CONTEXT ===
                %s
                
                === GITHUB URL ===
                %s
                
                === CURRENT MILESTONE ===
                %s
                
                CRITICAL RULES:
                1. NEVER read code blocks out loud. Give high-level hints.
                2. Be encouraging. Wait for the user to respond.
                3. Keep your answers brief.
                """.formatted(
                planContext.buildPlanContext(plan),
                plan.getGithubUrl(),
                milestoneContext.buildMilestoneContext(milestone)
        );

        String accessToken;
        try {
            GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
            credentials.refreshIfExpired();
            accessToken = credentials.getAccessToken().getTokenValue();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Google Cloud Token", e);
        }

        return new VoiceSessionResponse(
                accessToken,
                systemInstruction,
                System.getenv("PROJECT_ID"),
                "us-central1",
                "gemini-2.5-pro"
        );
    }
}
