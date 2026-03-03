package org.devbulchandani.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "milestone_notes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneNotes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    @JsonIgnore
    private Milestone milestone;

    @Column(columnDefinition = "TEXT")
    private String markdownContent;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotesStatus status;

    @Column(nullable = false)
    private int version = 1;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
