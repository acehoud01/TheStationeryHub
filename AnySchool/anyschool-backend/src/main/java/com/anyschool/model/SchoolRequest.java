package com.anyschool.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * School Request/OnBoarding Entity
 * 
 * Represents a SCHOOL_ADMIN's request to onboard/link to a school.
 * - NEW school request: School name provided (new school to be created)
 * - EXISTING school link request: School selected existings chool without admin
 * 
 * Status: PENDING (awaiting super admin approval), APPROVED, REJECTED
 * 
 * Phase 7D: School Admin Onboarding
 */
@Entity
@Table(name = "school_requests")
public class SchoolRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User (SCHOOL_ADMIN) who submitted the request
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Type: NEW_SCHOOL or LINK_EXISTING_SCHOOL
     */
    @Column(nullable = false, length = 50)
    private String requestType; // "NEW_SCHOOL" or "LINK_EXISTING_SCHOOL"

    /**
     * For NEW_SCHOOL: School name being requested
     */
    @Column(length = 200)
    private String schoolName;

    /**
     * School phone number
     */
    @Column(length = 20)
    private String phoneNumber;

    /**
     * School province/location
     */
    @Column(length = 100)
    private String province;

    /**
     * For LINK_EXISTING_SCHOOL: ID of existing school to link to
     */
    @Column(nullable = true)
    private Long linkedSchoolId;

    /**
     * Request status: PENDING, APPROVED, REJECTED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SchoolRequestStatus status = SchoolRequestStatus.PENDING;

    /**
     * If APPROVED and NEW_SCHOOL, the created school ID
     */
    @Column(nullable = true)
    private Long createdSchoolId;

    /**
     * Admin notes or rejection reason
     */
    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================================
    // Constructors
    // =========================================================================

    public SchoolRequest() {}

    public SchoolRequest(String schoolName, String phoneNumber, String province, User user) {
        this.requestType = "NEW_SCHOOL";
        this.schoolName = schoolName;
        this.phoneNumber = phoneNumber;
        this.province = province;
        this.user = user;
        this.status = SchoolRequestStatus.PENDING;
    }

    public SchoolRequest(Long linkedSchoolId, User user) {
        this.requestType = "LINK_EXISTING_SCHOOL";
        this.linkedSchoolId = linkedSchoolId;
        this.user = user;
        this.status = SchoolRequestStatus.PENDING;
    }

    // =========================================================================
    // Getters and Setters
    // =========================================================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public Long getLinkedSchoolId() { return linkedSchoolId; }
    public void setLinkedSchoolId(Long linkedSchoolId) { this.linkedSchoolId = linkedSchoolId; }

    public SchoolRequestStatus getStatus() { return status; }
    public void setStatus(SchoolRequestStatus status) { this.status = status; }

    public Long getCreatedSchoolId() { return createdSchoolId; }
    public void setCreatedSchoolId(Long createdSchoolId) { this.createdSchoolId = createdSchoolId; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "SchoolRequest{" +
                "id=" + id +
                ", requestType='" + requestType + '\'' +
                ", status=" + status +
                ", schoolName='" + schoolName + '\'' +
                ", linkedSchoolId=" + linkedSchoolId +
                ", createdSchoolId=" + createdSchoolId +
                ", createdAt=" + createdAt +
                '}';
    }
}