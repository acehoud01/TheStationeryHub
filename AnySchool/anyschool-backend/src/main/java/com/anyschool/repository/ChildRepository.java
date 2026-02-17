package com.anyschool.repository;

import com.anyschool.model.Child;
import com.anyschool.model.School;
import com.anyschool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ChildRepository
 * 
 * Data access for child entities
 * Phase 7C: Parent-Child Linking
 */
@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {

    /**
     * Find all children for a parent (newest first)
     */
    List<Child> findByParentOrderByCreatedAtDesc(User parent);

    /**
     * Find a specific child by ID and parent (for authorization)
     */
    Optional<Child> findByIdAndParent(Long id, User parent);

    /**
     * Find all children at a specific school
     */
    List<Child> findBySchool(School school);

    /**
     * Find all children at a school by verification status
     */
    List<Child> findBySchoolAndVerificationStatusOrderByCreatedAtDesc(School school, String status);

    /**
     * Count pending verifications for a school
     */
    Long countBySchoolAndVerificationStatus(School school, String status);

    /**
     * Find children by school and grade
     */
    List<Child> findBySchoolAndGradeOrderByNameAsc(School school, String grade);
}