package com.anyschool.model;

/**
 * Order Status Enum
 * 
 * Represents the status of an order throughout its lifecycle.
 * 
 * NEW WORKFLOW (Feb 2026):
 * 0. PENDING - Order created but payment not received
 * 1. APPROVED - Order payment received, awaiting purchasing admin acknowledgment
 * 2. ACKNOWLEDGED - Purchasing admin acknowledged, order being reviewed
 * 3. IN_PROCESS - Order in process (or sent to super admin if >= R1000)
 * 4. FINALIZING - Payment verified, finalizing the order
 * 5. OUT_FOR_DELIVERY - Order out for delivery
 * 6. DELIVERED - Order delivered to recipient
 * 7. CLOSED - Transaction complete and closed
 * 
 * PAYMENT TRACKING:
 * RETURNED - Order returned to user due to payment failure (from PENDING)
 * 
 * OTHER STATUSES:
 * DECLINED - Super admin declined the order (for orders >= R1000)
 * CANCELLED - Order cancelled by user or admin
 */
public enum OrderStatus {
    PENDING,
    APPROVED,
    ACKNOWLEDGED,
    IN_PROCESS,
    FINALIZING,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CLOSED,
    DECLINED,
    CANCELLED,
    RETURNED,
    
    // Legacy statuses (kept for backward compatibility)
    @Deprecated
    PURCHASE_IN_PROGRESS,
    @Deprecated
    PACKAGED,
    @Deprecated
    COMPLETED
}
