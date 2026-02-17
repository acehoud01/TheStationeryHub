package com.anyschool.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Message Entity
 * 
 * Represents direct messages between parents and schools
 * Thread-based messaging with parent-school conversations
 * 
 * Phase 7D: Communication System
 */
@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * School involved in the conversation
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /**
     * Parent user involved in the conversation
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private User parent;

    /**
     * Child this conversation is about (optional)
     */
    @Column(name = "child_id", nullable = true)
    private Long childId;

    /**
     * User who sent this message
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;

    /**
     * Message subject (first message in thread)
     */
    @Column(nullable = true, length = 200)
    private String subject;

    /**
     * Message content
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Thread ID for grouping messages in a conversation
     * First message creates thread, replies use same threadId
     */
    @Column(name = "thread_id", nullable = true)
    private Long threadId;

    /**
     * Whether this is the first message in a thread
     */
    @Column(nullable = false)
    private Boolean isThreadStart;

    /**
     * Whether the message has been read by the recipient
     */
    @Column(nullable = false)
    private Boolean isRead;

    /**
     * When the message was sent
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    /**
     * When the message was read
     */
    @Column(nullable = true)
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
        if (isRead == null) {
            isRead = false;
        }
        if (isThreadStart == null) {
            isThreadStart = (threadId == null);
        }
    }

    /**
     * Mark message as read
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
