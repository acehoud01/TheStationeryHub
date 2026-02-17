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
 * StationeryBundle Entity
 * 
 * Represents a pre-configured bundle of stationery items for a specific grade level.
 * Created by schools to simplify ordering for parents.
 * 
 * Features:
 * - Linked to a specific school
 * - Associated with a grade level
 * - Contains multiple stationery items
 * - Has a fixed price
 * - Can be marked as final (schools can prevent parents from modifying)
 */
@Entity
@Table(name = "stationery_bundles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationeryBundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * School that created this bundle
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    /**
     * Grade for which this bundle is intended
     * Example: "1", "5", "10"
     */
    @Column(nullable = false, length = 50)
    private String grade;

    /**
     * Bundle name
     * Example: "Grade 1 Comprehensive Stationery Bundle"
     */
    @Column(nullable = false, length = 200)
    private String name;

    /**
     * Bundle description
     */
    @Column(length = 500)
    private String description;

    /**
     * Total price of the bundle
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Stationery items in this bundle
     * ManyToMany relationship with Stationery
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "bundle_stationery",
        joinColumns = @JoinColumn(name = "bundle_id"),
        inverseJoinColumns = @JoinColumn(name = "stationery_id")
    )
    @Builder.Default
    private List<Stationery> stationeryItems = new ArrayList<>();

    /**
     * Whether this bundle is marked as final by the school
     * When marked final, parents cannot edit or remove items from orders containing this bundle
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFinalized = false;

    /**
     * When the bundle was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the bundle was last updated
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
     * Helper method to add a stationery item
     */
    public void addStationeryItem(Stationery item) {
        if (!stationeryItems.contains(item)) {
            stationeryItems.add(item);
        }
    }

    /**
     * Helper method to remove a stationery item
     */
    public void removeStationeryItem(Stationery item) {
        stationeryItems.remove(item);
    }
}
