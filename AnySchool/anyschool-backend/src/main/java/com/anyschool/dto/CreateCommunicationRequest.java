package com.anyschool.dto;

import lombok.Data;

/**
 * CreateCommunicationRequest
 * 
 * Request DTO for creating school communications/announcements
 * Phase 7D: Communication System - Enhanced with targeting
 */
@Data
public class CreateCommunicationRequest {

    /**
     * Communication title
     */
    private String title;

    /**
     * Communication message/content
     */
    private String message;

    /**
     * Communication type: ANNOUNCEMENT, EVENT, REMINDER, URGENT, GENERAL
     */
    private String type;

    /**
     * Priority level: LOW, MEDIUM, HIGH
     */
    private String priority;

    /**
     * Target audience: ALL, SPECIFIC_GRADES, SPECIFIC_CHILD
     */
    private String targetAudience;

    /**
     * Comma-separated list of target grades (if targetAudience = SPECIFIC_GRADES)
     * Example: "1,2,3" or "10,11,12"
     */
    private String targetGrades;

    /**
     * Target child ID (if targetAudience = SPECIFIC_CHILD)
     * Single child communication
     */
    private Long targetChildId;

    /**
     * Whether this communication should be published immediately
     * Default: true
     */
    private Boolean published;

    /**
     * School ID (only for SUPER_ADMIN role to send messages to specific schools)
     */
    private Long schoolId;
}