package com.anyoffice.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "office_inventory_tracking")
public class InventoryTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stationery_id", nullable = false)
    private Long stationeryId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;

    @Column(length = 200)
    private String location;

    @Column(name = "last_restocked_date")
    private LocalDate lastRestockedDate;

    @Column(name = "last_restocked_quantity")
    private Integer lastRestockedQuantity;

    @Column(name = "average_monthly_consumption", precision = 10, scale = 2)
    private BigDecimal averageMonthlyConsumption;

    @Column(name = "projected_depletion_date")
    private LocalDate projectedDepletionDate;

    @Column(name = "auto_reorder_enabled", nullable = false)
    private boolean autoReorderEnabled = false;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStationeryId() { return stationeryId; }
    public void setStationeryId(Long stationeryId) { this.stationeryId = stationeryId; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getLastRestockedDate() { return lastRestockedDate; }
    public void setLastRestockedDate(LocalDate lastRestockedDate) { this.lastRestockedDate = lastRestockedDate; }

    public Integer getLastRestockedQuantity() { return lastRestockedQuantity; }
    public void setLastRestockedQuantity(Integer lastRestockedQuantity) { this.lastRestockedQuantity = lastRestockedQuantity; }

    public BigDecimal getAverageMonthlyConsumption() { return averageMonthlyConsumption; }
    public void setAverageMonthlyConsumption(BigDecimal averageMonthlyConsumption) { this.averageMonthlyConsumption = averageMonthlyConsumption; }

    public LocalDate getProjectedDepletionDate() { return projectedDepletionDate; }
    public void setProjectedDepletionDate(LocalDate projectedDepletionDate) { this.projectedDepletionDate = projectedDepletionDate; }

    public boolean isAutoReorderEnabled() { return autoReorderEnabled; }
    public void setAutoReorderEnabled(boolean autoReorderEnabled) { this.autoReorderEnabled = autoReorderEnabled; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
