package org.devbulchandani.backend.models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "learning_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    private String tech;

    @Column(nullable = false)
    private String projectName;

    private String projectDescription;

    @Column(nullable = false)
    private int durationDays;

    @Column(nullable = false)
    private String skillLevel;

    private String projectPath;

    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL)
    private List<Milestone> milestones;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
