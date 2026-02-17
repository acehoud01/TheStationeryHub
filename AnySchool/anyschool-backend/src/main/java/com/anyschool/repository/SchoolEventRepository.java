package com.anyschool.repository;

import com.anyschool.model.SchoolEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SchoolEventRepository extends JpaRepository<SchoolEvent, Long> {
    
    List<SchoolEvent> findBySchoolIdOrderByEventDateAsc(Long schoolId);
    
    @Query("SELECT e FROM SchoolEvent e WHERE e.school.id = :schoolId AND e.eventDate >= :fromDate ORDER BY e.eventDate ASC")
    List<SchoolEvent> findUpcomingEventsBySchoolId(Long schoolId, LocalDateTime fromDate);
    
    @Query("SELECT e FROM SchoolEvent e WHERE e.school.id = :schoolId AND e.eventDate BETWEEN :startDate AND :endDate ORDER BY e.eventDate ASC")
    List<SchoolEvent> findEventsBySchoolIdAndDateRange(Long schoolId, LocalDateTime startDate, LocalDateTime endDate);
}
