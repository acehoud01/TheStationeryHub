package com.anyschool.controller;

import com.anyschool.dto.CreateCommunicationRequest;
import com.anyschool.model.Communication;
import com.anyschool.model.School;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.model.Child;
import com.anyschool.repository.CommunicationRepository;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.repository.ChildRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * CommunicationController
 * 
 * Handles school communications/announcements
 * Phase 7D: Communication System - Enhanced targeting
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/communications")
@Slf4j
public class CommunicationController {

    @Autowired
    private CommunicationRepository communicationRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private ChildRepository childRepository;

    /**
     * Create a new communication (School Admin only)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> createCommunication(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateCommunicationRequest request) {
        
        log.info("Creating communication from user: {}", currentUser.getEmail());

        try {
            // Validate request
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Title is required"
                ));
            }

            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Message is required"
                ));
            }

            // Determine school based on role
            School school;
            if (UserRole.SUPER_ADMIN.equals(currentUser.getRole())) {
                // Super admin must specify a school (can access communications for any school)
                if (request.getSchoolId() == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "School ID is required - please select a specific school to send messages to"
                    ));
                }
                school = schoolRepository.findById(request.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));
            } else if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                // School admin uses their own school
                if (currentUser.getSchoolId() == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "School admin must be linked to a school"
                    ));
                }
                school = schoolRepository.findById(currentUser.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only school admins and super admins can send communications"
                ));
            }

            // Determine target audience and validate
            String targetAudience = "ALL";
            String targetGrades = null;
            Long targetChildId = null;
            
            if (request.getTargetAudience() != null) {
                switch (request.getTargetAudience()) {
                    case "SPECIFIC_GRADES":
                        if (request.getTargetGrades() == null || request.getTargetGrades().trim().isEmpty()) {
                            return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "message", "Target grades required for grade-specific messages"
                            ));
                        }
                        targetAudience = "SPECIFIC_GRADES";
                        targetGrades = request.getTargetGrades().trim();
                        break;
                    case "SPECIFIC_CHILD":
                        if (request.getTargetChildId() == null) {
                            return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "message", "Target child ID required for individual messages"
                            ));
                        }
                        // Validate child exists and belongs to this school
                        Optional<Child> child = childRepository.findById(request.getTargetChildId());
                        if (child.isEmpty() || !child.get().getSchool().getId().equals(school.getId())) {
                            return ResponseEntity.badRequest().body(Map.of(
                                "success", false,
                                "message", "Child not found at this school"
                            ));
                        }
                        targetAudience = "SPECIFIC_CHILD";
                        targetChildId = request.getTargetChildId();
                        break;
                    case "ALL":
                    default:
                        targetAudience = "ALL";
                        break;
                }
            }

            // Create communication
            Communication communication = Communication.builder()
                    .school(school)
                    .createdBy(currentUser)
                    .title(request.getTitle().trim())
                    .message(request.getMessage().trim())
                    .type(request.getType() != null ? request.getType() : "GENERAL")
                    .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                    .targetAudience(targetAudience)
                    .targetGrades(targetGrades)
                    .targetChildId(targetChildId)
                    .published(request.getPublished() != null ? request.getPublished() : true)
                    .isRead(false)
                    .build();

            Communication saved = communicationRepository.save(communication);

            log.info("Communication created successfully with id: {} targeting: {} {}", 
                    saved.getId(), targetAudience, 
                    targetGrades != null ? "grades: " + targetGrades : (targetChildId != null ? "childId: " + targetChildId : ""));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Communication created successfully",
                "communication", buildCommunicationResponse(saved)
            ));

        } catch (Exception e) {
            log.error("Error creating communication", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to create communication: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all communications for current user's school (School Admin)
     */
    @GetMapping("/school")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getMySchoolCommunications(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching communications for school admin: {}", currentUser.getEmail());

        try {
            if (currentUser.getSchoolId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "School admin must be linked to a school"
                ));
            }

            School school = schoolRepository.findById(currentUser.getSchoolId())
                    .orElseThrow(() -> new IllegalArgumentException("School not found"));

            List<Communication> communications = communicationRepository.findBySchoolOrderByCreatedAtDesc(school);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", communications.size(),
                "communications", communications.stream()
                        .map(this::buildCommunicationResponse)
                        .collect(Collectors.toList())
            ));

        } catch (Exception e) {
            log.error("Error fetching school communications", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch communications: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all communications for a school by ID (Admin view)
     */
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSchoolCommunications(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long schoolId) {
        
        log.info("Fetching communications for school: {}", schoolId);

        try {
            if (!schoolId.equals(currentUser.getSchoolId())) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Not authorized to view this school's communications"
                ));
            }

            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new IllegalArgumentException("School not found"));

            List<Communication> communications = communicationRepository.findBySchoolOrderByCreatedAtDesc(school);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", communications.size(),
                "communications", communications.stream()
                        .map(this::buildCommunicationResponse)
                        .collect(Collectors.toList())
            ));

        } catch (Exception e) {
            log.error("Error fetching school communications", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch communications: " + e.getMessage()
            ));
        }
    }

    /**
     * Get communications for parent's children
     * Filters based on target audience and child info
     */
    @GetMapping("/parent")
    @PreAuthorize("hasRole('PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getParentCommunications(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching communications for parent: {}", currentUser.getEmail());

        try {
            var children = childRepository.findByParentOrderByCreatedAtDesc(currentUser);

            Map<String, List<Map<String, Object>>> communicationsBySchool = new HashMap<>();

            // For each child, get relevant communications
            for (var child : children) {
                if (child.getSchool() == null) {
                    log.debug("Skipping child {} - no school linked", child.getName());
                    continue;
                }
                
                String schoolName = child.getSchool().getName();
                School school = child.getSchool();
                
                // Get communications for this child
                List<Communication> relevantComms = communicationRepository
                        .findBySchoolOrderByCreatedAtDesc(school).stream()
                        .filter(comm -> isRelevantToChild(comm, child))
                        .collect(Collectors.toList());

                List<Map<String, Object>> commResponses = relevantComms.stream()
                        .map(comm -> {
                            Map<String, Object> commMap = buildCommunicationResponse(comm);
                            commMap.put("childName", child.getName());
                            commMap.put("childGrade", child.getGrade());
                            commMap.put("childId", child.getId());
                            return commMap;
                        })
                        .collect(Collectors.toList());

                communicationsBySchool.merge(schoolName, commResponses, (existing, newList) -> {
                    existing.addAll(newList);
                    return existing;
                });
            }

            log.info("Found communications from {} schools", communicationsBySchool.size());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "communicationsBySchool", communicationsBySchool
            ));

        } catch (Exception e) {
            log.error("Error fetching parent communications", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch communications: " + e.getMessage()
            ));
        }
    }

    /**
     * Check if a communication is relevant to a specific child
     * 
     * Super Admin messages are ONLY for School Admin, not parents/children
     */
    private boolean isRelevantToChild(Communication comm, Child child) {
        if (!comm.getPublished()) {
            return false;
        }

        // Super Admin messages are NOT visible to parents/children - only to school admin
        if (comm.getCreatedBy() != null && UserRole.SUPER_ADMIN.equals(comm.getCreatedBy().getRole())) {
            return false;
        }

        switch (comm.getTargetAudience()) {
            case "ALL":
                // Visible to all children at the school
                return true;
            case "SPECIFIC_GRADES":
                // Only visible if child's grade matches
                if (comm.getTargetGrades() == null) {
                    return false;
                }
                String[] grades = comm.getTargetGrades().split(",");
                for (String grade : grades) {
                    if (grade.trim().equals(child.getGrade())) {
                        return true;
                    }
                }
                return false;
            case "SPECIFIC_CHILD":
                // Only visible if it's their child
                return comm.getTargetChildId() != null && comm.getTargetChildId().equals(child.getId());
            default:
                return false;
        }
    }

    /**
     * Delete communication (School Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteCommunication(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        
        log.info("Deleting communication: {}", id);

        try {
            Communication communication = communicationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Communication not found"));

            if (!communication.getSchool().getId().equals(currentUser.getSchoolId())) {
                return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Not authorized to delete this communication"
                ));
            }

            communicationRepository.delete(communication);

            log.info("Communication deleted successfully");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Communication deleted successfully"
            ));

        } catch (Exception e) {
            log.error("Error deleting communication", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to delete communication: " + e.getMessage()
            ));
        }
    }

    /**
     * Get unread messages for current user (School Admin or Parent)
     * 
     * For School Admin: returns unread messages from their school
     * For Parent: returns unread messages for their children
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','PARENT')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getUnreadMessages(
            @AuthenticationPrincipal User currentUser) {
        
        log.info("Fetching unread messages for user: {}", currentUser.getEmail());

        try {
            List<Map<String, Object>> unreadMessages = new ArrayList<>();
            
            if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                // School admin gets unread messages from their school
                if (currentUser.getSchoolId() == null) {
                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "unreadCount", 0,
                        "messages", unreadMessages
                    ));
                }

                School school = schoolRepository.findById(currentUser.getSchoolId())
                        .orElseThrow(() -> new IllegalArgumentException("School not found"));

                List<Communication> unread = communicationRepository
                        .findBySchoolAndIsReadFalseOrderByCreatedAtDesc(school);

                for (Communication comm : unread) {
                    Map<String, Object> msg = buildCommunicationResponse(comm);
                    unreadMessages.add(msg);
                }

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "unreadCount", unread.size(),
                    "messages", unreadMessages,
                    "userRole", "SCHOOL_ADMIN",
                    "schoolName", school.getName()
                ));

            } else if (UserRole.PARENT.equals(currentUser.getRole())) {
                // Parent gets unread messages for their children
                List<Child> children = childRepository.findByParentOrderByCreatedAtDesc(currentUser);
                
                Map<String, Map<String, Object>> messagesBySchoolChild = new HashMap<>();
                int totalUnread = 0;

                for (Child child : children) {
                    if (child.getSchool() == null) continue;

                    School school = child.getSchool();
                    List<Communication> relevantComms = communicationRepository
                            .findBySchoolOrderByCreatedAtDesc(school).stream()
                            .filter(comm -> !comm.getIsRead() && isRelevantToChild(comm, child))
                            .collect(Collectors.toList());

                    if (relevantComms.size() > 0) {
                        totalUnread += relevantComms.size();
                        
                        for (Communication comm : relevantComms) {
                            Map<String, Object> msg = buildCommunicationResponse(comm);
                            msg.put("childName", child.getName());
                            msg.put("schoolName", school.getName());
                            
                            String key = school.getId() + "_" + child.getId();
                            messagesBySchoolChild.put(key, msg);
                        }
                    }
                }

                unreadMessages = new ArrayList<>(messagesBySchoolChild.values());

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "unreadCount", totalUnread,
                    "messages", unreadMessages,
                    "userRole", "PARENT"
                ));
            }

            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Only parents and school admins can view unread messages"
            ));

        } catch (Exception e) {
            log.error("Error fetching unread messages", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to fetch unread messages: " + e.getMessage()
            ));
        }
    }

    /**
     * Mark a communication as read
     */
    @PutMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN','PARENT')")
    @Transactional
    public ResponseEntity<Map<String, Object>> markAsRead(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        
        log.info("Marking communication {} as read for user: {}", id, currentUser.getEmail());

        try {
            Communication communication = communicationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Communication not found"));

            // Verify user has permission to mark this as read
            if (UserRole.SCHOOL_ADMIN.equals(currentUser.getRole())) {
                if (!communication.getSchool().getId().equals(currentUser.getSchoolId())) {
                    return ResponseEntity.status(403).body(Map.of(
                        "success", false,
                        "message", "Not authorized"
                    ));
                }
            } else if (UserRole.PARENT.equals(currentUser.getRole())) {
                // Verify parent has a child at this school
                List<Child> children = childRepository.findByParentOrderByCreatedAtDesc(currentUser);
                boolean hasChild = children.stream()
                        .anyMatch(c -> c.getSchool().getId().equals(communication.getSchool().getId()));
                
                if (!hasChild) {
                    return ResponseEntity.status(403).body(Map.of(
                        "success", false,
                        "message", "Not authorized"
                    ));
                }
            }

            communication.setIsRead(true);
            communicationRepository.save(communication);

            log.info("Communication {} marked as read", id);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message marked as read"
            ));

        } catch (Exception e) {
            log.error("Error marking communication as read", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to mark as read: " + e.getMessage()
            ));
        }
    }

    /**
     * Build communication response map
     */
    private Map<String, Object> buildCommunicationResponse(Communication comm) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", comm.getId());
        response.put("title", comm.getTitle());
        response.put("message", comm.getMessage());
        response.put("type", comm.getType());
        response.put("priority", comm.getPriority());
        response.put("targetAudience", comm.getTargetAudience());
        response.put("targetGrades", comm.getTargetGrades());
        response.put("targetChildId", comm.getTargetChildId());
        response.put("published", comm.getPublished());
        response.put("isRead", comm.getIsRead());
        response.put("createdAt", comm.getCreatedAt().toString());
        response.put("updatedAt", comm.getUpdatedAt().toString());
        
        // School info
        Map<String, Object> schoolInfo = new HashMap<>();
        schoolInfo.put("id", comm.getSchool().getId());
        schoolInfo.put("name", comm.getSchool().getName());
        response.put("school", schoolInfo);

        return response;
    }
}