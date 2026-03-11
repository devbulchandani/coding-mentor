package org.devbulchandani.backend.services;

import org.devbulchandani.backend.bots.MentorBot;
import org.devbulchandani.backend.events.MilestoneNotesEvent;
import org.devbulchandani.backend.models.LearningPlan;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.repositories.LearningPlanRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {
    private final MentorBot mentorBot;
    private final MilestoneRepository milestoneRepo;
    private final LearningPlanRepository planRepo;
    private final MilestoneContextService milestoneContext;
    private final LearningContextService planContext;
    private final ApplicationEventPublisher publisher;

    public VerificationService(MentorBot mentorBot, MilestoneRepository milestoneRepo, LearningPlanRepository planRepo, MilestoneContextService milestoneContext, LearningContextService planContext, ApplicationEventPublisher publisher) {
        this.mentorBot = mentorBot;
        this.milestoneRepo = milestoneRepo;
        this.planRepo = planRepo;
        this.milestoneContext = milestoneContext;
        this.planContext = planContext;
        this.publisher = publisher;
    }

    public String verifyMilestone(Long milestoneId) {
        Milestone m = milestoneRepo.findById(milestoneId)
                .orElseThrow();

        LearningPlan plan = m.getLearningPlan();
        String repoUrl = plan.getGithubUrl();

        String prompt = """
                You are reviewing the user's progress.
                
                GITHUB REPO:
                %s
                
                IMPORTANT INSTRUCTION:
                Before judging, you MAY use MCP tools to:
                - get_project_structure(...)
                - read_file(...)
                - read_files(...)
                
                
                Only after inspecting the code, decide whether this milestone is COMPLETE.
                
                === LEARNING PLAN ===
                %s
                
                === CURRENT MILESTONE ===
                %s
                
                If complete, start your answer with: COMPLETED and briefly explain why.
                Otherwise, explain what is still missing (Socratically, no code).
                """
                .formatted(
                        repoUrl,
                        planContext.buildPlanContext(plan),
                        milestoneContext.buildMilestoneContext(m)
                );


        String aiResponse = mentorBot.chat(prompt);

        boolean completed = aiResponse.contains("COMPLETED");
        m.setCompleted(completed);
        milestoneRepo.save(m);

        if (completed) {
            plan.getMilestones().stream()
                    .filter(ms -> !ms.isCompleted() && ms.getSequenceNumber() > m.getSequenceNumber())
                    .min(java.util.Comparator.comparingInt(Milestone::getSequenceNumber))
                    .ifPresent(nextMilestone -> {
                        publisher.publishEvent(new MilestoneNotesEvent(nextMilestone.getId(), repoUrl));
                    });
        }
        return aiResponse;
    }
}
