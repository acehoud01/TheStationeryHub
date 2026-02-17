package com.anyschool.dto;

import lombok.Data;

import java.util.List;

/**
 * Create Order Request DTO
 * 
 * Data transfer object for creating a new order.
 * 
 * Contains:
 * - School ID
 * - Student details (grade, name)
 * - Order type (PURCHASE or DONATION)
 * - List of order items
 */
@Data
public class CreateOrderRequest {

    /**
     * ID of the school receiving the order
     * Optional if requestedSchoolName is provided (school pending approval)
     */
    private Long schoolId;

    /**
     * Requested school name (when school not in system yet)
     * Used when parent requests a new school during checkout
     * Either schoolId OR requestedSchoolName must be provided
     */
    private String requestedSchoolName;

    /**
     * ID of the child this order is for (for parent orders)
     * Optional - only for PARENT users with children
     */
    private Long childId;

    /**
     * Student grade (e.g., "1", "5", "10")
     */
    private String studentGrade;

    /**
     * Student name
     */
    private String studentName;

    /**
     * Type of order: PURCHASE or DONATION
     */
    private String orderType;

    /**
     * Academic year (e.g., "2026", "2027")
     * Required for all orders
     */
    private String academicYear;

    /**
     * Payment type: IMMEDIATE or PAYMENT_PLAN
     * IMMEDIATE - Pay now (for current year orders)
     * PAYMENT_PLAN - Monthly instalments (for next year orders)
     */
    private String paymentType;

    /**
     * Debit order day of month (1-31)
     * Required for PAYMENT_PLAN, null for IMMEDIATE
     */
    private Integer debitOrderDay;

    /**
     * List of items in the order
     */
    private List<OrderItemRequest> items;

    /**
     * Order Item Request
     * Represents a single item in the order
     */
    @Data
    public static class OrderItemRequest {
        /**
         * Stationery item ID
         */
        private Long stationeryId;

        /**
         * Quantity to order
         */
        private Integer quantity;
    }
}