package com.anyschool.service;

import com.anyschool.dto.SchoolEventDTO;
import com.anyschool.exception.ResourceNotFoundException;
import com.anyschool.model.School;
import com.anyschool.model.SchoolEvent;
import com.anyschool.repository.SchoolEventRepository;
import com.anyschool.repository.SchoolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SchoolEventService {
    
    @Autowired
    private SchoolEventRepository schoolEventRepository;
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    public SchoolEventDTO createEvent(SchoolEventDTO eventDTO) {
        School school = schoolRepository.findById(eventDTO.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        
        SchoolEvent event = new SchoolEvent();
        event.setSchool(school);
        event.setEventName(eventDTO.getEventName());
        event.setEventDate(eventDTO.getEventDate());
        event.setEventTime(eventDTO.getEventTime());
        event.setDescription(eventDTO.getDescription());
        event.setAllDay(eventDTO.getAllDay() != null ? eventDTO.getAllDay() : false);
        
        SchoolEvent savedEvent = schoolEventRepository.save(event);
        return convertToDTO(savedEvent);
    }
    
    public SchoolEventDTO updateEvent(Long eventId, SchoolEventDTO eventDTO) {
        SchoolEvent event = schoolEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        
        event.setEventName(eventDTO.getEventName());
        event.setEventDate(eventDTO.getEventDate());
        event.setEventTime(eventDTO.getEventTime());
        event.setDescription(eventDTO.getDescription());
        event.setAllDay(eventDTO.getAllDay() != null ? eventDTO.getAllDay() : false);
        
        SchoolEvent updatedEvent = schoolEventRepository.save(event);
        return convertToDTO(updatedEvent);
    }
    
    public void deleteEvent(Long eventId) {
        SchoolEvent event = schoolEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        schoolEventRepository.delete(event);
    }
    
    public SchoolEventDTO getEventById(Long eventId) {
        SchoolEvent event = schoolEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        return convertToDTO(event);
    }
    
    public List<SchoolEventDTO> getAllEventsBySchool(Long schoolId) {
        return schoolEventRepository.findBySchoolIdOrderByEventDateAsc(schoolId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<SchoolEventDTO> getUpcomingEventsBySchool(Long schoolId) {
        LocalDateTime now = LocalDateTime.now();
        return schoolEventRepository.findUpcomingEventsBySchoolId(schoolId, now)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<SchoolEventDTO> getEventsByDateRange(Long schoolId, LocalDateTime startDate, LocalDateTime endDate) {
        return schoolEventRepository.findEventsBySchoolIdAndDateRange(schoolId, startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private SchoolEventDTO convertToDTO(SchoolEvent event) {
        return new SchoolEventDTO(
                event.getId(),
                event.getSchool().getId(),
                event.getSchool().getName(),
                event.getEventName(),
                event.getEventDate(),
                event.getEventTime(),
                event.getDescription(),
                event.getAllDay(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
