package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.VoiceSessionResponse;
import org.devbulchandani.backend.services.VoiceSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plans/{planId}/voice")
public class VoiceController {
    private final VoiceSessionService voiceSessionService;

    public VoiceController(VoiceSessionService voiceSessionService) {
        this.voiceSessionService = voiceSessionService;
    }

    @GetMapping("/session/{milestoneId}")
    public ResponseEntity<VoiceSessionResponse> getVoiceSession(
            @PathVariable Long planId,
            @PathVariable Long milestoneId) {
        return ResponseEntity.ok(voiceSessionService.createVoiceSession(planId, milestoneId));
    }
}
