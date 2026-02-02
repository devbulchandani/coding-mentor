package org.devbulchandani.backend.models;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    private String projectName;

    private String projectDescription;

    private String durationDays;

    private String skillLevel;

    private String projectPath;

    @CreationTimestamp
    private String createdAt;

    @UpdateTimestamp
    private String updatedAt;

}
