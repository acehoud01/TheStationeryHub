package com.anyschool.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Order Item Entity
 * 
 * Represents a single stationery item within an order.
 * 
 * Features:
 * - Links to parent Order
 * - Links to Stationery item
 * - Quantity ordered
 * - Price at time of order (snapshot)
 * - Subtotal (quantity × price)
 */
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Parent order
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * Stationery item ordered
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stationery_id", nullable = false)
    private Stationery stationery;

    /**
     * Quantity ordered
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Price at time of order (snapshot)
     * Stored separately in case stationery price changes later
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Subtotal for this item (quantity × price)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    /**
     * Calculate and set subtotal based on quantity and price
     */
    public void calculateSubtotal() {
        if (quantity != null && price != null) {
            this.subtotal = price.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
