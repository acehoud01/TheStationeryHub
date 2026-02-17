package com.anyoffice.repository;

import com.anyoffice.model.OfficeNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeNotificationRepository extends JpaRepository<OfficeNotification, Long> {
    List<OfficeNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OfficeNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
}
