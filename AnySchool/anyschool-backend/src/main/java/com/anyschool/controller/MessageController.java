// Fix 1: MessageController.java - Fix role comparisons
package com.anyschool.controller;

import com.anyschool.dto.SendMessageRequest;
import com.anyschool.model.Message;
import com.anyschool.model.School;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.MessageRepository;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.repository.UserRepository;
import com.anyschool.repository.ChildRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * MessageController
 * 
 * Handles direct messaging between parents and schools
 * Phase 7D: Communication System
 */
@RestController
@RequestMapping("/api/messages")
@Slf4j
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    /**
     * Send a message (parent to school or school to parent)
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @RequestBody SendMessageRequest request) {
        
        log.info("Sending message from user: {} with role: {}", currentUser.getEmail(), currentUser.getRole());

        try {
            // Determine if this is a new thread or reply
            boolean isNewThread = (request.getThreadId() == null);

            // Validate
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Message content is required"
                ));
            }

            if (isNewThread && (request.getSubject() == null || request.getSubject().trim().isEmpty())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Subject is required for new messages"
                ));
            }

            School school;
            User parent;

            // Determine school and parent based on sender role - FIX: Use UserRole enum
            if (UserRole.PARENT.equals(currentUser.getRole())) {
                // Parent sending to school
                if (request.getSchoolId() == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "School ID is required"
                    ));
                }
                school = schoolRepository.findById(request.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));
                parent = currentUser;

            } else if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                // School sending to parent
                if (request.getParentId() == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Parent ID is required"
                    ));
                }
                parent = userRepository.findById(request.getParentId())
                        .orElseThrow(() -> new IllegalArgumentException("Parent not found"));
                
                // Verify parent is a PARENT
                if (!UserRole.PARENT.equals(parent.getRole())) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Can only send messages to parents"
                    ));
                }
                
                school = schoolRepository.findById(currentUser.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));

                // Verify this parent has a child at this school
                var parentChildren = childRepository.findByParentOrderByCreatedAtDesc(parent);
                boolean hasChildAtSchool = parentChildren.stream()
                        .anyMatch(child -> child.getSchool() != null && 
                                         child.getSchool().getId().equals(school.getId()));
                
                if (!hasChildAtSchool) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "This parent does not have a child at your school"
                    ));
                }

            } else {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Only parents and school admins can send messages"
                ));
            }

            // Create message
            Message message = Message.builder()
                    .school(school)
                    .parent(parent)
                    .childId(request.getChildId())
                    .sender(currentUser)
                    .subject(isNewThread ? request.getSubject().trim() : null)
                    .content(request.getContent().trim())
                    .threadId(request.getThreadId())
                    .isThreadStart(isNewThread)
                    .isRead(false)
                    .build();

            Message saved = messageRepository.save(message);

            // If this is a new thread, update threadId to point to itself
            if (isNewThread) {
                saved.setThreadId(saved.getId());
                saved = messageRepository.save(saved);
            }

            log.info("Message sent successfully with id: {}", saved.getId());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent successfully",
                "messageData", buildMessageResponse(saved)
            ));

        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to send message: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all message threads for current user
     */
    @GetMapping("/threads")
    public ResponseEntity<Map<String, Object>> getThreads(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching threads for user: {} with role: {}", currentUser.getEmail(), currentUser.getRole());

        try {
            List<Message> threads;

            // FIX: Use UserRole enum comparison
            if (UserRole.PARENT.equals(currentUser.getRole())) {
                threads = messageRepository.findByParentAndIsThreadStartTrueOrderBySentAtDesc(currentUser);
            } else if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                School school = schoolRepository.findById(currentUser.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));
                threads = messageRepository.findBySchoolAndIsThreadStartTrueOrderBySentAtDesc(school);
            } else {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Unauthorized"
                ));
            }

            // For each thread, get unread count and last message
            List<Map<String, Object>> threadResponses = threads.stream()
                    .map(thread -> {
                        List<Message> threadMessages = messageRepository.findByThreadIdOrderBySentAtAsc(thread.getThreadId());
                        
                        long unreadCount = threadMessages.stream()
                                .filter(m -> !m.getSender().equals(currentUser) && !m.getIsRead())
                                .count();

                        Message lastMessage = threadMessages.get(threadMessages.size() - 1);

                        Map<String, Object> threadData = buildMessageResponse(thread);
                        threadData.put("unreadCount", unreadCount);
                        threadData.put("lastMessage", lastMessage.getContent());
                        threadData.put("lastMessageAt", lastMessage.getSentAt().toString());
                        threadData.put("messageCount", threadMessages.size());

                        return threadData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", threadResponses.size(),
                "threads", threadResponses
            ));

        } catch (Exception e) {
            log.error("Error fetching threads", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch threads: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all messages in a thread
     */
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<Map<String, Object>> getThread(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long threadId) {
        
        log.info("Fetching thread: {} for user: {}", threadId, currentUser.getEmail());

        try {
            List<Message> messages = messageRepository.findByThreadIdOrderBySentAtAsc(threadId);

            if (messages.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thread not found"
                ));
            }

            // Verify user has access to this thread
            Message firstMessage = messages.get(0);
            boolean hasAccess = false;

            // FIX: Use UserRole enum comparison
            if (UserRole.PARENT.equals(currentUser.getRole())) {
                hasAccess = firstMessage.getParent().equals(currentUser);
            } else if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                hasAccess = firstMessage.getSchool().getId().equals(currentUser.getSchoolId());
            }

            if (!hasAccess) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Not authorized to view this thread"
                ));
            }

            // Mark unread messages as read
            messages.stream()
                    .filter(m -> !m.getSender().equals(currentUser) && !m.getIsRead())
                    .forEach(m -> {
                        m.markAsRead();
                        messageRepository.save(m);
                    });

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", messages.size(),
                "messages", messages.stream()
                        .map(this::buildMessageResponse)
                        .collect(Collectors.toList())
            ));

        } catch (Exception e) {
            log.error("Error fetching thread", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch thread: " + e.getMessage()
            ));
        }
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {
        
        try {
            long unreadCount;

            // FIX: Use UserRole enum comparison
            if (UserRole.PARENT.equals(currentUser.getRole())) {
                unreadCount = messageRepository.countByParentAndIsReadFalseAndSenderNot(currentUser, currentUser);
            } else if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                School school = schoolRepository.findById(currentUser.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));
                unreadCount = messageRepository.countUnreadForSchool(school, currentUser);
            } else {
                unreadCount = 0;
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "unreadCount", unreadCount
            ));

        } catch (Exception e) {
            log.error("Error fetching unread count", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch unread count: " + e.getMessage()
            ));
        }
    }

    /**
     * Get list of parents at this school (for school admin to send direct messages)
     */
    @GetMapping("/school/parents")
    public ResponseEntity<Map<String, Object>> getSchoolParents(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching parents for school admin: {}", currentUser.getEmail());

        try {
            // Verify user is school admin
            if (!UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Only school admins can access this endpoint"
                ));
            }

            School school = schoolRepository.findById(currentUser.getSchoolId())
                    .orElseThrow(() -> new IllegalArgumentException("School not found"));

            // Get all children at this school
            var childrenAtSchool = childRepository.findBySchool(school);

            // Get unique parents
            Set<User> parentSet = new HashSet<>();
            for (var child : childrenAtSchool) {
                if (child.getParent() != null) {
                    parentSet.add(child.getParent());
                }
            }

            List<Map<String, Object>> parents = parentSet.stream()
                    .map(parent -> {
                        Map<String, Object> parentInfo = new HashMap<>();
                        parentInfo.put("id", parent.getId());
                        parentInfo.put("name", parent.getFullName());
                        parentInfo.put("email", parent.getEmail());
                        
                        // Get children of this parent at this school
                        var parentChildren = childrenAtSchool.stream()
                                .filter(c -> c.getParent().equals(parent))
                                .map(c -> {
                                    Map<String, Object> childInfo = new HashMap<>();
                                    childInfo.put("id", c.getId());
                                    childInfo.put("name", c.getName());
                                    childInfo.put("grade", c.getGrade());
                                    return childInfo;
                                })
                                .collect(Collectors.toList());
                        
                        parentInfo.put("children", parentChildren);
                        return parentInfo;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", parents.size(),
                "parents", parents
            ));

        } catch (Exception e) {
            log.error("Error fetching school parents", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch parents: " + e.getMessage()
            ));
        }
    }

    /**
     * Build message response map
     */
    private Map<String, Object> buildMessageResponse(Message message) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", message.getId());
        response.put("subject", message.getSubject());
        response.put("content", message.getContent());
        response.put("threadId", message.getThreadId());
        response.put("isThreadStart", message.getIsThreadStart());
        response.put("isRead", message.getIsRead());
        response.put("sentAt", message.getSentAt().toString());
        response.put("childId", message.getChildId());
        
        // Sender info
        Map<String, Object> senderInfo = new HashMap<>();
        senderInfo.put("id", message.getSender().getId());
        senderInfo.put("name", message.getSender().getFullName());
        senderInfo.put("role", message.getSender().getRole().name());
        response.put("sender", senderInfo);

        // School info
        Map<String, Object> schoolInfo = new HashMap<>();
        schoolInfo.put("id", message.getSchool().getId());
        schoolInfo.put("name", message.getSchool().getName());
        response.put("school", schoolInfo);

        // Parent info
        Map<String, Object> parentInfo = new HashMap<>();
        parentInfo.put("id", message.getParent().getId());
        parentInfo.put("name", message.getParent().getFullName());
        response.put("parent", parentInfo);

        return response;
    }
}