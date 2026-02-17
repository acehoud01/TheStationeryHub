package com.anyschool.dto;

import java.time.LocalDate;

/**
 * Create Child Request DTO
 *
 * Phase 7C: Parent-Child Linking
 * Fix: added requestedSchoolName for unlisted schools.
 * Update: added dateOfBirth for child profile display.
 *
 * Either schoolId OR requestedSchoolName must be provided – not both.
 */
public class CreateChildRequest {

    private String name;
    private String grade;

    /** Optional date of birth. */
    private LocalDate dateOfBirth;

    /** ID of an existing school. Provide this OR requestedSchoolName. */
    private Long schoolId;

    /** Free-text name of a school not in the system. Provide this OR schoolId. */
    private String requestedSchoolName;

    // Constructors
    public CreateChildRequest() {}

    public CreateChildRequest(String name, String grade, Long schoolId) {
        this.name = name;
        this.grade = grade;
        this.schoolId = schoolId;
    }

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Long getSchoolId() { return schoolId; }
    public void setSchoolId(Long schoolId) { this.schoolId = schoolId; }

    public String getRequestedSchoolName() { return requestedSchoolName; }
    public void setRequestedSchoolName(String requestedSchoolName) { this.requestedSchoolName = requestedSchoolName; }
}
