package com.anyschool.dto;

import lombok.Data;

/**
 * Update Order Status Request DTO
 * 
 * Data transfer object for updating order status.
 * Used for payment processing and status changes.
 */
@Data
public class UpdateOrderStatusRequest {

    /**
     * New status for the order
     * Must be valid OrderStatus enum value
     */
    private String status;

    /**
     * Payment reference (optional)
     * Used to track payment transactions
     */
    private String paymentReference;
}
