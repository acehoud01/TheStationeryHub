package com.anyschool.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Child Entity
 *
 * Phase 7C: Parent-Child Linking
 * Fix: school is now nullable; requestedSchoolName added for unlisted schools.
 */
@Entity
@Table(name = "children")
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Child name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Grade is required")
    @Size(max = 20, message = "Grade must not exceed 20 characters")
    @Column(nullable = false, length = 20)
    private String grade;

    /**
     * Date of birth — optional, used to display age and verify school year.
     */
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    /**
     * Linked school (nullable – null when requestedSchoolName is used instead).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "school_id", nullable = true)
    private School school;

    /**
     * Free-text name of a school that is not yet in the system.
     * Mutually exclusive with 'school'. Admin can link the child to the
     * proper School entity once the school is approved.
     */
    @Column(name = "requested_school_name", length = 200)
    private String requestedSchoolName;

    /**
     * PENDING  - awaiting school verification
     * APPROVED - school verified the child
     * REJECTED - school rejected the child
     * UNLINKED - child uses a requested (unlisted) school
     */
    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "PENDING";

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

    // Constructors
    public Child() {}

    public Child(String name, String grade, User parent, School school) {
        this.name = name;
        this.grade = grade;
        this.parent = parent;
        this.school = school;
        this.verificationStatus = "PENDING";
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public User getParent() { return parent; }
    public void setParent(User parent) { this.parent = parent; }

    public School getSchool() { return school; }
    public void setSchool(School school) { this.school = school; }

    public String getRequestedSchoolName() { return requestedSchoolName; }
    public void setRequestedSchoolName(String requestedSchoolName) { this.requestedSchoolName = requestedSchoolName; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Child{id=" + id + ", name='" + name + "', grade='" + grade +
               "', schoolId=" + (school != null ? school.getId() : null) +
               ", requestedSchoolName='" + requestedSchoolName + "'" +
               ", verificationStatus=" + verificationStatus + '}';
    }
}