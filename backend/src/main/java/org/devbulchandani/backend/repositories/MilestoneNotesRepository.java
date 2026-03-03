package org.devbulchandani.backend.repositories;

import org.devbulchandani.backend.models.MilestoneNotes;
import org.devbulchandani.backend.models.NotesStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneNotesRepository extends JpaRepository<MilestoneNotes, Long> {
    Optional<MilestoneNotes> findFirstByMilestoneIdAndStatusOrderByVersionDesc(long milestone_id, NotesStatus status);
    List<MilestoneNotes> findAllByMilestoneIdOrderByVersionDesc(Long milestoneId);
}
