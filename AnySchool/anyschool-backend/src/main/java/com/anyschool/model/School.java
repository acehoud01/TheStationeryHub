package com.anyschool.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * School Entity
 * 
 * Represents a school in the AnySchool system.
 * Each school can have one SCHOOL_ADMIN user assigned.
 * 
 * Phase 7D: School Admin Linking
 */
@Entity
@Table(name = "schools")
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "School name is required")
    @Size(min = 2, max = 200, message = "School name must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String district;

    @NotBlank(message = "Province is required")
    @Size(max = 100, message = "Province must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String province;

    /**
     * Comma-separated list of grades (e.g., "1,2,3,4,5")
     */
    @Size(max = 100, message = "Grades must not exceed 100 characters")
    @Column(length = 100)
    private String grades;

    /**
     * Contact phone number for the school
     */
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(length = 20)
    private String phone;

    /**
     * School admin user (one-to-one relationship)
     * Nullable - school doesn't have admin until one is assigned
     */
    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "admin_user_id", nullable = true)
    private User admin;

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

    public School() {}

    public School(String name, String district, String province) {
        this.name = name;
        this.district = district;
        this.province = province;
    }

    // =========================================================================
    // Getters and Setters
    // =========================================================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getGrades() { return grades; }
    public void setGrades(String grades) { this.grades = grades; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "School{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", district='" + district + '\'' +
                ", province='" + province + '\'' +
                ", phone='" + phone + '\'' +
                ", admin=" + (admin != null ? admin.getId() : null) +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}