package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.events.MilestoneNotesEvent;
import org.devbulchandani.backend.models.MilestoneNotes;
import org.devbulchandani.backend.repositories.MilestoneNotesRepository;
import org.devbulchandani.backend.services.NotesGenerationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/milestones")
public class MilestoneController {
    private final MilestoneNotesRepository notesRepo;
    private final ApplicationEventPublisher publisher;
    private final NotesGenerationService notesGenerationService;

    public MilestoneController(MilestoneNotesRepository notesRepo, ApplicationEventPublisher publisher, NotesGenerationService notesGenerationService) {
        this.notesRepo = notesRepo;
        this.publisher = publisher;
        this.notesGenerationService = notesGenerationService;
    }

    @GetMapping("/{milestoneId}/notes")
    public ResponseEntity<MilestoneNotes> getMilestoneNotes(@PathVariable Long milestoneId) {
        List<MilestoneNotes> notes = notesRepo.findAllByMilestoneIdOrderByVersionDesc(milestoneId);
        if (notes.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notes.get(0));
    }

    @PostMapping("/{milestoneId}/notes/generate")
    public ResponseEntity<MilestoneNotes> generateNotes(@PathVariable Long milestoneId) {
        publisher.publishEvent(new MilestoneNotesEvent(milestoneId, ""));
        return ResponseEntity.accepted().build();
    }
}
