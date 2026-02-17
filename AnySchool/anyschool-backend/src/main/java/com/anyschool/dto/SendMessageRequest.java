package com.anyschool.dto;

import lombok.Data;

/**
 * SendMessageRequest
 * 
 * Request DTO for sending messages between parents and schools
 * Phase 7D: Communication System
 */
@Data
public class SendMessageRequest {

    /**
     * School ID (for parents sending to school)
     */
    private Long schoolId;

    /**
     * Parent user ID (for schools sending to parent)
     */
    private Long parentId;

    /**
     * Child ID this message is about (optional)
     */
    private Long childId;

    /**
     * Message subject (for new threads only)
     */
    private String subject;

    /**
     * Message content
     */
    private String content;

    /**
     * Thread ID (for replies)
     * Null if starting a new thread
     */
    private Long threadId;
}
