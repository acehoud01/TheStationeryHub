package com.anyoffice.repository;

import com.anyoffice.model.OfficeOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeOrderItemRepository extends JpaRepository<OfficeOrderItem, Long> {
    List<OfficeOrderItem> findByOrderId(Long orderId);
}
