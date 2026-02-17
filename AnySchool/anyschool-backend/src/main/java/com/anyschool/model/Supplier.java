package com.anyschool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Supplier Entity
 * 
 * Represents a supplier/vendor in the system.
 * Can be manufacturers, wholesalers, or retail partners.
 * 
 * Use cases:
 * - Track multiple suppliers for products
 * - Manage supplier partnerships and contracts
 * - Compare pricing across suppliers
 * - Generate reports for negotiations
 */
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Supplier name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(nullable = false, length = 200)
    private String name;

    @Size(max = 100, message = "Contact person name must not exceed 100 characters")
    @Column(length = 100)
    private String contactPerson;

    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(length = 100)
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(length = 20)
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(length = 500)
    private String address;

    @NotBlank(message = "Supplier type is required")
    @Column(nullable = false, length = 50)
    private String supplierType; // MANUFACTURER, WHOLESALER, RETAILER, DISTRIBUTOR

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private Boolean active = true;

    /**
     * Payment terms (e.g., "Net 30", "Net 60", "COD")
     */
    @Column(length = 100)
    private String paymentTerms;

    /**
     * Minimum order value for this supplier
     */
    @Column(length = 100)
    private String minimumOrderValue;

    /**
     * Delivery time estimate (e.g., "3-5 business days")
     */
    @Column(length = 100)
    private String deliveryTime;

    /**
     * Contract start date (if any)
     */
    @Column
    private LocalDateTime contractStartDate;

    /**
     * Contract end date (if any)
     */
    @Column
    private LocalDateTime contractEndDate;

    /**
     * Products supplied by this supplier
     */
    @JsonIgnore
    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Stationery> products = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Supplier() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getSupplierType() {
        return supplierType;
    }

    public void setSupplierType(String supplierType) {
        this.supplierType = supplierType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getMinimumOrderValue() {
        return minimumOrderValue;
    }

    public void setMinimumOrderValue(String minimumOrderValue) {
        this.minimumOrderValue = minimumOrderValue;
    }

    public String getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(String deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public LocalDateTime getContractStartDate() {
        return contractStartDate;
    }

    public void setContractStartDate(LocalDateTime contractStartDate) {
        this.contractStartDate = contractStartDate;
    }

    public LocalDateTime getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(LocalDateTime contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public List<Stationery> getProducts() {
        return products;
    }

    public void setProducts(List<Stationery> products) {
        this.products = products;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "Supplier{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", contactPerson='" + contactPerson + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", supplierType='" + supplierType + '\'' +
                ", active=" + active +
                ", createdAt=" + createdAt +
                '}';
    }
}
