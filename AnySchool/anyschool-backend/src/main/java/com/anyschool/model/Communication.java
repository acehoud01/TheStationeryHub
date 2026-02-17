package com.anyschool.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Communication Entity
 * 
 * Represents announcements/communications posted by schools
 * Visible to parents with children at that school
 * 
 * Phase 7D: Communication System - Enhanced with targeting
 */
@Entity
@Table(name = "communications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Communication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * School posting the communication
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /**
     * Admin/staff user who created the communication
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    /**
     * Communication title
     */
    @Column(nullable = false, length = 200)
    private String title;

    /**
     * Communication message/content
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Communication type: ANNOUNCEMENT, EVENT, REMINDER, URGENT, GENERAL
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Priority level: LOW, MEDIUM, HIGH
     */
    @Column(nullable = false, length = 20)
    private String priority;

    /**
     * Target audience: ALL (whole school), SPECIFIC_GRADES, SPECIFIC_CHILD
     */
    @Column(nullable = false, length = 50)
    private String targetAudience;

    /**
     * Comma-separated list of target grades (if targetAudience = SPECIFIC_GRADES)
     * Example: "1,2,3" or "10,11,12"
     */
    @Column(nullable = true, length = 100)
    private String targetGrades;

    /**
     * Target child ID (if targetAudience = SPECIFIC_CHILD)
     */
    @Column(nullable = true)
    private Long targetChildId;

    /**
     * When the communication was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the communication was last updated
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Whether this communication is published (visible to parents)
     */
    @Column(nullable = false)
    private Boolean published;

    /**
     * Whether this communication has been read by the recipient
     * Used to track unread messages for school admins and parents
     */
    @Column(nullable = false)
    private Boolean isRead;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (published == null) {
            published = true; // Default to published
        }
        if (isRead == null) {
            isRead = false; // Default to unread
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}