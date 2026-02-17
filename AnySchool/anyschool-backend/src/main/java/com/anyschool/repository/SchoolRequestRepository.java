package com.anyschool.repository;

import com.anyschool.model.SchoolRequest;
import com.anyschool.model.SchoolRequestStatus;
import com.anyschool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SchoolRequestRepository
 * 
 * Data access for school onboarding requests
 * Phase 7D: School Admin Onboarding
 */
@Repository
public interface SchoolRequestRepository extends JpaRepository<SchoolRequest, Long> {

    /**
     * Find all requests by a user
     */
    List<SchoolRequest> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all requests by status (with eager loading of User)
     */
    @Query("SELECT sr FROM SchoolRequest sr LEFT JOIN FETCH sr.user WHERE sr.status = ?1 ORDER BY sr.createdAt DESC")
    List<SchoolRequest> findByStatusOrderByCreatedAtDesc(SchoolRequestStatus status);

    /**
     * Find reviews by request type
     */
    List<SchoolRequest> findByRequestTypeOrderByCreatedAtDesc(String requestType);
}