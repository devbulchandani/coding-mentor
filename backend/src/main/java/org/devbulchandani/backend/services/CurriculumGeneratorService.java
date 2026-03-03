package org.devbulchandani.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import org.devbulchandani.backend.dtos.CurriculumResponse;
import org.devbulchandani.backend.events.MilestoneNotesEvent;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.models.User;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.devbulchandani.backend.repositories.UserRepository;
import org.devbulchandani.backend.utils.JwtUtil;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CurriculumGeneratorService {
    private final ChatModel gemini;
    private final ObjectMapper mapper = new ObjectMapper();
    private final LearningPlanRepository planRepo;
    private final MilestoneRepository milestoneRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final ApplicationEventPublisher publisher;


    public CurriculumGeneratorService(ChatModel gemini, LearningPlanRepository planRepo, MilestoneRepository milestoneRepo, UserRepository userrepo, JwtUtil jwtUtil, ApplicationEventPublisher publisher) {
        this.gemini = gemini;
        this.planRepo = planRepo;
        this.milestoneRepo = milestoneRepo;
        this.userRepo = userrepo;
        this.jwtUtil = jwtUtil;
        this.publisher = publisher;
    }

    public LearningPlan generatePlan(String token, String tech, int days, String skillLevel) {
        String prompt = buildPrompt(tech, days, skillLevel);

        String aiJson = gemini.chat(prompt);

        aiJson = aiJson.replace("```json", "");
        aiJson = aiJson.replace("```", "").trim();

        String email = jwtUtil.extractEmail(token);
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            CurriculumResponse response =
                    mapper.readValue(aiJson, CurriculumResponse.class);

            LearningPlan plan = LearningPlan.builder()
                    .tech(tech)
                    .durationDays(days)
                    .user(user)
                    .projectName(response.projectName())
                    .projectDescription(response.projectDescription())
                    .skillLevel(skillLevel)
                    .build();

            plan = planRepo.save(plan);

            Milestone firstMilestone = null;

            for (var m : response.milestones()) {
                Milestone milestone = Milestone.builder()
                        .learningPlan(plan)
                        .sequenceNumber(m.sequenceNumber())
                        .title(m.title())
                        .description(m.description())
                        .learningObjectives(m.learningObjectives())
                        .completed(false)
                        .build();

                milestoneRepo.save(milestone);

                if (milestone.getSequenceNumber() == 1) {
                    firstMilestone = milestone;
                }
            }
            System.out.println("Plans: " + plan);
            if (firstMilestone != null) {
                publisher.publishEvent(new MilestoneNotesEvent(firstMilestone.getId(), ""));
            }

            return plan;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private String buildPrompt(String tech, int days, String level) {
        return """
                You are an expert curriculum designer for software developers.
                
                Create a project-based learning plan in JSON ONLY.
                
                Technology: %s
                Duration (days): %d
                Skill Level: %s
                
                Rules:
                - Choose ONE real project idea.
                - Create 3 to 5 milestones only.
                - Each milestone must be concrete and buildable.
                - Each milestone should teach exactly one core concept.
                - Do NOT include code.
                - Return ONLY valid JSON in this exact format:
                
                {
                  "projectName": "...",
                  "projectDescription": "...",
                  "milestones": [
                    {
                      "sequenceNumber": 1,
                      "title": "...",
                      "description": "...",
                      "learningObjectives": "..."
                    },
                    .
                    .
                    .
                  ]
                }
                """.formatted(tech, days, level);
    }

    public List<LearningPlan> findByUserEmail(String token){
        String email = jwtUtil.extractEmail(token);
        return planRepo.findByUserEmail(email);
    }

    public LearningPlan updateGithubUrl(long learningPlanId, String githubUrl, String token){
        String email = jwtUtil.extractEmail(token);
        LearningPlan plan = planRepo.findById(learningPlanId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (!plan.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: This plan does not belong to you");
        }

        plan.setGithubUrl(githubUrl);
        planRepo.save(plan);
        return plan;
    }

    public LearningPlan getPlanById(long planId) {
        return planRepo.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }
}

