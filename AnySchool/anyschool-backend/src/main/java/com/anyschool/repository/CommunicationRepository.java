package com.anyschool.repository;

import com.anyschool.model.Communication;
import com.anyschool.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CommunicationRepository
 * 
 * Data access for school communications/announcements
 * Phase 7D: Communication System
 */
@Repository
public interface CommunicationRepository extends JpaRepository<Communication, Long> {

    /**
     * Find all published communications for a school, ordered by most recent
     */
    List<Communication> findBySchoolAndPublishedTrueOrderByCreatedAtDesc(School school);

    /**
     * Find all communications for a school (admin view, includes unpublished)
     */
    List<Communication> findBySchoolOrderByCreatedAtDesc(School school);

    /**
     * Find communications for a specific grade at a school
     */
    @Query("SELECT c FROM Communication c WHERE c.school = :school " +
           "AND c.published = true " +
           "AND (c.targetAudience = 'ALL' OR " +
           "(c.targetAudience = 'SPECIFIC_GRADES' AND c.targetGrades LIKE CONCAT('%', :grade, '%'))) " +
           "ORDER BY c.createdAt DESC")
    List<Communication> findBySchoolAndGrade(@Param("school") School school, @Param("grade") String grade);

    /**
     * Count unread communications for a parent's child
     * (Communications created after child was added or last login)
     */
    @Query("SELECT COUNT(c) FROM Communication c WHERE c.school.id = :schoolId " +
           "AND c.published = true " +
           "AND (c.targetAudience = 'ALL' OR " +
           "(c.targetAudience = 'SPECIFIC_GRADES' AND c.targetGrades LIKE CONCAT('%', :grade, '%')))")
    Long countForSchoolAndGrade(@Param("schoolId") Long schoolId, @Param("grade") String grade);

    /**
     * Find high priority communications
     */
    List<Communication> findBySchoolAndPublishedTrueAndPriorityOrderByCreatedAtDesc(
        School school, String priority);

    /**
     * Find unread communications for a school (for school admin notifications)
     */
    List<Communication> findBySchoolAndIsReadFalseOrderByCreatedAtDesc(School school);
}