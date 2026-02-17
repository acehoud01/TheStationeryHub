package com.anyschool.repository;

import com.anyschool.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Order Item Repository
 * 
 * Data access layer for OrderItem entities.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Custom query methods can be added here if needed
}
