package com.anyschool.dto;

import java.time.LocalDateTime;

public class SchoolEventDTO {
    
    private Long id;
    private Long schoolId;
    private String schoolName;
    private String eventName;
    private LocalDateTime eventDate;
    private String eventTime;
    private String description;
    private Boolean allDay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public SchoolEventDTO() {}
    
    public SchoolEventDTO(Long id, Long schoolId, String schoolName, String eventName, 
                         LocalDateTime eventDate, String eventTime, String description, 
                         Boolean allDay, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.schoolId = schoolId;
        this.schoolName = schoolName;
        this.eventName = eventName;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.description = description;
        this.allDay = allDay;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSchoolId() {
        return schoolId;
    }
    
    public void setSchoolId(Long schoolId) {
        this.schoolId = schoolId;
    }
    
    public String getSchoolName() {
        return schoolName;
    }
    
    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }
    
    public String getEventName() {
        return eventName;
    }
    
    public void setEventName(String eventName) {
        this.eventName = eventName;
    }
    
    public LocalDateTime getEventDate() {
        return eventDate;
    }
    
    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }
    
    public String getEventTime() {
        return eventTime;
    }
    
    public void setEventTime(String eventTime) {
        this.eventTime = eventTime;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Boolean getAllDay() {
        return allDay;
    }
    
    public void setAllDay(Boolean allDay) {
        this.allDay = allDay;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
