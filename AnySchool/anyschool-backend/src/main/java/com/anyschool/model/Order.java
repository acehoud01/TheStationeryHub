package com.anyschool.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity
 * 
 * Represents an order placed by a user (parent) for a school.
 * 
 * Features:
 * - Links to User (parent placing the order)
 * - Links to School (beneficiary school)
 * - Order type (PURCHASE or DONATION)
 * - Student details (grade, name)
 * - Order items (stationery items)
 * - Status tracking (PENDING, PROCESSING, COMPLETED, CANCELLED)
 * - Timestamps
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User who placed the order (parent/donor)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * School that will receive the order
     * Optional when parent requests a new school (pending approval)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = true)
    private School school;

    /**
     * Requested school name (when school not yet in system)
     * Used when parent requests a new school during checkout
     * Will be linked to school.id after admin approval
     */
    @Column(nullable = true, length = 200)
    private String requestedSchoolName;

    /**
     * Type of order: PURCHASE or DONATION
     */
    @Column(nullable = false)
    private String orderType;

    /**
     * Child ID (for parent orders with child profiles)
     * Optional - links to child profile if parent has added children
     * Null for donations or legacy orders
     */
    @Column(nullable = true)
    private Long childId;

    /**
     * Student grade (for parent orders)
     * Optional - only required for PURCHASE orders
     * Example: "1", "5", "10"
     */
    @Column(nullable = true)
    private String studentGrade;

    /**
     * Student name (for parent orders)
     * Optional - only required for PURCHASE orders
     */
    @Column(nullable = true)
    private String studentName;

    /**
     * Total amount for the order (sum of all items)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    /**
     * Current status of the order
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    /**
     * Order items (stationery items in this order)
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    /**
     * Bundle used for this order (optional)
     * Links to StationeryBundle if order was created from a bundle
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bundle_id", nullable = true)
    private StationeryBundle bundle;

    /**
     * Whether this order is marked as final by the school
     * When marked final, parents cannot edit or remove order items
     * Only school admins can mark orders as final
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isMarkedFinal = false;

    /**
     * Academic year for this order (e.g., "2026", "2027")
     * Required for all orders
     */
    @Column(nullable = false)
    @Builder.Default
    private String academicYear = "2026";

    /**
     * Payment type: IMMEDIATE or PAYMENT_PLAN
     * IMMEDIATE - Pay now (for current year orders)
     * PAYMENT_PLAN - Monthly instalments (for next year orders)
     */
    @Column(nullable = false)
    @Builder.Default
    private String paymentType = "IMMEDIATE";

    /**
     * Month when order was placed (1-12)
     * Used for payment plan calculations
     */
    @Column(nullable = true)
    private Integer orderMonth;

    /**
     * Number of months for payment plan
     * Null for immediate payments
     */
    @Column(nullable = true)
    private Integer paymentPlanMonths;

    /**
     * Number of payments received for payment plan
     * Tracks installment progress: 0 to paymentPlanMonths
     * Default 0, null for immediate payments
     */
    @Column(nullable = true)
    @Builder.Default
    private Integer paymentsReceived = 0;

    /**
     * Monthly instalment amount for payment plan
     * Null for immediate payments
     */
    @Column(nullable = true, precision = 10, scale = 2)
    private BigDecimal monthlyInstalment;

    /**
     * Debit order day of month (1-31)
     * Null for immediate payments
     */
    @Column(nullable = true)
    private Integer debitOrderDay;

    /**
     * First debit order date
     * Null for immediate payments
     */
    @Column(nullable = true)
    private LocalDateTime firstDebitDate;

    /**
     * Last debit order date
     * Null for immediate payments
     */
    @Column(nullable = true)
    private LocalDateTime lastDebitDate;

    /**
     * When the order was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the order was last updated
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Lifecycle callback to set timestamps before persisting
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Lifecycle callback to update timestamp before updating
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Helper method to add an order item
     */
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    /**
     * Helper method to remove an order item
     */
    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }
}