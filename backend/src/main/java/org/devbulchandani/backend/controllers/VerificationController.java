package org.devbulchandani.backend.controllers;

import org.devbulchandani.backend.dtos.VerifyRequest;
import org.devbulchandani.backend.services.VerificationService;
import org.devbulchandani.backend.dtos.VerifyRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/verify")
public class VerificationController {
    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/{milestoneId}")
    public Map<String, Object> verify(
            @PathVariable Long milestoneId,
            @RequestBody(required = false) VerifyRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String aiFeedback;
        if (request != null && request.files() != null && !request.files().isEmpty()) {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Sign in before checking your project code.");
            }
            aiFeedback = verificationService.verifyMilestone(milestoneId, request.files(), authHeader.substring("Bearer ".length()));
        } else {
            aiFeedback = verificationService.verifyMilestone(milestoneId);
        }

        return Map.of(
                "completed", aiFeedback.contains("COMPLETED"),
                "feedback", aiFeedback,
                "milestoneId", milestoneId
        );
    }
}
