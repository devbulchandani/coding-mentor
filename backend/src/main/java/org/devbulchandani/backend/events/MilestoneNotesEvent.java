package org.devbulchandani.backend.events;

import org.devbulchandani.backend.models.Milestone;
import org.devbulchandani.backend.models.NotesStatus;

public record MilestoneNotesEvent(long milestone_id, String repoUrl) {
}
