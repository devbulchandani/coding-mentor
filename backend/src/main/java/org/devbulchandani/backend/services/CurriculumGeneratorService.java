package org.devbulchandani.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatModel;
import org.devbulchandani.backend.dtos.CurriculumResponse;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.springframework.stereotype.Service;

@Service
public class CurriculumGeneratorService {
    private final ChatModel gemini;
    private final ObjectMapper mapper = new ObjectMapper();
    private final LearningPlanRepository planRepo;
    private final MilestoneRepository milestoneRepo;

    public CurriculumGeneratorService(ChatModel gemini, LearningPlanRepository planRepo, MilestoneRepository milestoneRepo) {
        this.gemini = gemini;
        this.planRepo = planRepo;
        this.milestoneRepo = milestoneRepo;
    }

    public LearningPlan generatePlan( String tech, int days, String skillLevel) {
        String prompt = buildPrompt( tech, days, skillLevel);

        String aiJson = gemini.chat(prompt);

        try {
            CurriculumResponse response =
                    mapper.readValue(aiJson, CurriculumResponse.class);

            LearningPlan plan = LearningPlan.builder()
                    .tech(tech)
                    .durationDays(days)
                    .projectName(response.projectName())
                    .projectDescription(response.projectDescription())
                    .skillLevel(skillLevel)
                    .build();

            plan = planRepo.save(plan);

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
            }

            return plan;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private String buildPrompt( String tech, int days, String level) {
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
}

