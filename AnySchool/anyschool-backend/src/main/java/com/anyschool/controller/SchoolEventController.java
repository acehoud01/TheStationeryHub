package com.anyschool.controller;

import com.anyschool.dto.SchoolEventDTO;
import com.anyschool.service.SchoolEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/school-events")
@CrossOrigin(origins = "*")
public class SchoolEventController {
    
    @Autowired
    private SchoolEventService schoolEventService;
    
    @PostMapping
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<SchoolEventDTO> createEvent(@RequestBody SchoolEventDTO eventDTO) {
        SchoolEventDTO createdEvent = schoolEventService.createEvent(eventDTO);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }
    
    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<SchoolEventDTO> updateEvent(
            @PathVariable Long eventId,
            @RequestBody SchoolEventDTO eventDTO) {
        SchoolEventDTO updatedEvent = schoolEventService.updateEvent(eventId, eventDTO);
        return ResponseEntity.ok(updatedEvent);
    }
    
    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        schoolEventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{eventId}")
    public ResponseEntity<SchoolEventDTO> getEventById(@PathVariable Long eventId) {
        SchoolEventDTO event = schoolEventService.getEventById(eventId);
        return ResponseEntity.ok(event);
    }
    
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<SchoolEventDTO>> getAllEventsBySchool(@PathVariable Long schoolId) {
        List<SchoolEventDTO> events = schoolEventService.getAllEventsBySchool(schoolId);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/school/{schoolId}/upcoming")
    public ResponseEntity<List<SchoolEventDTO>> getUpcomingEventsBySchool(@PathVariable Long schoolId) {
        List<SchoolEventDTO> events = schoolEventService.getUpcomingEventsBySchool(schoolId);
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/school/{schoolId}/range")
    public ResponseEntity<List<SchoolEventDTO>> getEventsByDateRange(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SchoolEventDTO> events = schoolEventService.getEventsByDateRange(schoolId, startDate, endDate);
        return ResponseEntity.ok(events);
    }
}
