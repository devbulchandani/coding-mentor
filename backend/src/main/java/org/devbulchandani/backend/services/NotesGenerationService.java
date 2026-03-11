package org.devbulchandani.backend.services;

import dev.langchain4j.model.chat.ChatModel;
import org.devbulchandani.backend.bots.NotesGenerationBot;
import org.devbulchandani.backend.events.MilestoneNotesEvent;
import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.models.MilestoneNotes;
import org.devbulchandani.backend.models.NotesStatus;
import org.devbulchandani.backend.repositories.MilestoneNotesRepository;
import org.devbulchandani.backend.repositories.MilestoneRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotesGenerationService {
    private final ChatModel gemini2;
    private final MilestoneRepository milestoneRepo;
    private final MilestoneNotesRepository noteRepo;
    private final LearningContextService learningContextService;
    private final MilestoneContextService milestoneContextService;

    public NotesGenerationService(@Qualifier("gemini2") ChatModel gemini2,
                                  NotesGenerationBot notesGeneratorBot,
                                  MilestoneRepository milestoneRepo,
                                  MilestoneNotesRepository noteRepo,
                                  LearningContextService learningContextService,
                                  MilestoneContextService milestoneContextService) {
        this.gemini2 = gemini2;
        this.milestoneRepo = milestoneRepo;
        this.noteRepo = noteRepo;
        this.learningContextService = learningContextService;
        this.milestoneContextService = milestoneContextService;
    }

    @Async
    @EventListener
    @Transactional
    public void generateNotes(MilestoneNotesEvent event) {
        Milestone milestone = milestoneRepo.findById(event.milestone_id())
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        List<MilestoneNotes> existingNotes = noteRepo.findAllByMilestoneIdOrderByVersionDesc(event.milestone_id());
        int nextVersion = existingNotes.isEmpty() ? 1 : existingNotes.get(0).getVersion() + 1;

        MilestoneNotes note = MilestoneNotes.builder()
                .milestone(milestone)
                .status(NotesStatus.PENDING)
                .version(nextVersion)
                .build();
        note = noteRepo.save(note);

        try {
            String prompt = buildNotesPrompt(milestone, event.repoUrl());
            String markdownResponse = gemini2.chat(prompt);

            note.setMarkdownContent(markdownResponse);
            note.setStatus(NotesStatus.COMPLETED);
            noteRepo.save(note);
        } catch (Exception e) {
            note.setStatus(NotesStatus.FAILED);
            noteRepo.save(note);
            System.err.println("Failed to generate notes for milestone: " + e.getMessage());
        }

    }

    private String buildNotesPrompt(Milestone milestone, String previousCodeContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a senior software engineer and expert technical mentor. ");
        prompt.append("Your task is to write a highly structured, engaging Markdown article to teach a student the concepts required to complete their current milestone.\n\n");

        prompt.append("=== PROJECT CONTEXT ===\n");
        prompt.append(learningContextService.buildPlanContext(milestone.getLearningPlan())).append("\n");

        prompt.append("=== CURRENT MILESTONE ===\n");
        prompt.append(milestoneContextService.buildMilestoneContext(milestone));

        if (previousCodeContext != null && !previousCodeContext.isBlank()) {
            prompt.append("=== USER'S EXISTING CODE ===\n");
            prompt.append("The user just wrote this code for the previous milestone. ");
            prompt.append("You MUST use their actual variable names, class names, and architecture in your code examples to make the lesson hyper-personalized:\n");
            prompt.append(previousCodeContext).append("\n\n");
        }

        prompt.append("=== OUTPUT FORMAT & STRICT RULES ===\n");
        prompt.append("1. Output RAW Markdown ONLY. Do not wrap the response in ```markdown tags. No conversational filler.\n");
        prompt.append("2. SOCRATIC RULE: DO NOT write the exact final code they need to submit for this milestone. Teach the *concepts* using similar but distinct examples.\n");
        prompt.append("3. You MUST format the article using EXACTLY these sections:\n\n");

        prompt.append("## 🎯 Concept Overview\n");
        prompt.append("(Explain the core theory simply and why it matters in the context of this project.)\n\n");

        prompt.append("## 🏗️ Architecture & Flow\n");
        prompt.append("(Include ONE Mermaid.js diagram here. Use ```mermaid graph TD ... ``` or sequenceDiagram to ensure compatibility. Keep it clean and simple.)\n\n");

        prompt.append("## 💻 How It Works (Code Examples)\n");
        prompt.append("(Provide heavily commented, clear code snippets demonstrating the concept. Build upon their previous code if provided.)\n\n");

        prompt.append("## ⚠️ Common Pitfalls\n");
        prompt.append("(List 2-3 common mistakes junior developers make when implementing this.)\n\n");

        prompt.append("## 🚀 Your Next Steps\n");
        prompt.append("(Give a Socratic hint on how they should apply this knowledge to complete the current milestone, without giving them the actual answer.)\n");

        return prompt.toString();
    }


}
