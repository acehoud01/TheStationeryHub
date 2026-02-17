package com.anyschool.repository;

import com.anyschool.model.Order;
import com.anyschool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Order Repository
 * 
 * Data access layer for Order entities.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find all orders by user
     * Useful for showing a user's order history
     */
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find all orders by user ID
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all orders for a user with specific order type
     * Used for getting donations or purchases separately
     */
    List<Order> findByUserAndOrderTypeOrderByCreatedAtDesc(User user, String orderType);

    /**
     * Count orders by user and order type
     * Used for statistics (e.g., total number of donations)
     */
    Long countByUserAndOrderType(User user, String orderType);

    /**
     * Find all orders for a specific school
     * Used by school admins to see orders for their school
     */
    List<Order> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);

    /**
     * Find orders for a school with specific order type
     * Used to filter donations vs purchases for a school
     */
    List<Order> findBySchoolIdAndOrderTypeOrderByCreatedAtDesc(Long schoolId, String orderType);

    /**
     * Find orders by order type
     * Used for analytics (e.g., all donations)
     */
    List<Order> findByOrderType(String orderType);

    /**
     * Count orders by order type
     * Used for statistics
     */
    Integer countByOrderType(String orderType);

    /**
     * Find orders created after a specific date
     * Used for time-based analytics
     */
    List<Order> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Count orders created after a specific date
     */
    Integer countByCreatedAtAfter(LocalDateTime date);
}
