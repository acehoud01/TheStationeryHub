package com.anyschool.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for Business Analytics
 * Used for generating reports to negotiate with suppliers
 */
public class BusinessAnalyticsDto {

    // Platform metrics
    private Integer totalSchools;
    private Integer totalParents;
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private LocalDateTime reportGeneratedAt;
    
    // Order metrics
    private Integer ordersLast30Days;
    private Integer ordersLast90Days;
    private BigDecimal revenueLast30Days;
    private BigDecimal revenueLast90Days;
    private BigDecimal averageOrderValue;
    
    // Product metrics
    private Integer totalProducts;
    private List<TopProductDto> topSellingProducts;
    private Map<String, Integer> productsByCategory;
    
    // Supplier metrics
    private Integer totalSuppliers;
    private Map<String, Integer> suppliersByType;
    
    // Growth metrics
    private String monthOverMonthGrowth;
    private Integer projectedMonthlyOrders;
    
    // Social impact
    private Integer donationOrders;
    private BigDecimal totalDonationValue;
    private Integer schoolsReceivingDonations;

    // Constructors
    public BusinessAnalyticsDto() {
        this.reportGeneratedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getTotalSchools() {
        return totalSchools;
    }

    public void setTotalSchools(Integer totalSchools) {
        this.totalSchools = totalSchools;
    }

    public Integer getTotalParents() {
        return totalParents;
    }

    public void setTotalParents(Integer totalParents) {
        this.totalParents = totalParents;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public LocalDateTime getReportGeneratedAt() {
        return reportGeneratedAt;
    }

    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) {
        this.reportGeneratedAt = reportGeneratedAt;
    }

    public Integer getOrdersLast30Days() {
        return ordersLast30Days;
    }

    public void setOrdersLast30Days(Integer ordersLast30Days) {
        this.ordersLast30Days = ordersLast30Days;
    }

    public Integer getOrdersLast90Days() {
        return ordersLast90Days;
    }

    public void setOrdersLast90Days(Integer ordersLast90Days) {
        this.ordersLast90Days = ordersLast90Days;
    }

    public BigDecimal getRevenueLast30Days() {
        return revenueLast30Days;
    }

    public void setRevenueLast30Days(BigDecimal revenueLast30Days) {
        this.revenueLast30Days = revenueLast30Days;
    }

    public BigDecimal getRevenueLast90Days() {
        return revenueLast90Days;
    }

    public void setRevenueLast90Days(BigDecimal revenueLast90Days) {
        this.revenueLast90Days = revenueLast90Days;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public Integer getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Integer totalProducts) {
        this.totalProducts = totalProducts;
    }

    public List<TopProductDto> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<TopProductDto> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public Map<String, Integer> getProductsByCategory() {
        return productsByCategory;
    }

    public void setProductsByCategory(Map<String, Integer> productsByCategory) {
        this.productsByCategory = productsByCategory;
    }

    public Integer getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(Integer totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public Map<String, Integer> getSuppliersByType() {
        return suppliersByType;
    }

    public void setSuppliersByType(Map<String, Integer> suppliersByType) {
        this.suppliersByType = suppliersByType;
    }

    public String getMonthOverMonthGrowth() {
        return monthOverMonthGrowth;
    }

    public void setMonthOverMonthGrowth(String monthOverMonthGrowth) {
        this.monthOverMonthGrowth = monthOverMonthGrowth;
    }

    public Integer getProjectedMonthlyOrders() {
        return projectedMonthlyOrders;
    }

    public void setProjectedMonthlyOrders(Integer projectedMonthlyOrders) {
        this.projectedMonthlyOrders = projectedMonthlyOrders;
    }

    public Integer getDonationOrders() {
        return donationOrders;
    }

    public void setDonationOrders(Integer donationOrders) {
        this.donationOrders = donationOrders;
    }

    public BigDecimal getTotalDonationValue() {
        return totalDonationValue;
    }

    public void setTotalDonationValue(BigDecimal totalDonationValue) {
        this.totalDonationValue = totalDonationValue;
    }

    public Integer getSchoolsReceivingDonations() {
        return schoolsReceivingDonations;
    }

    public void setSchoolsReceivingDonations(Integer schoolsReceivingDonations) {
        this.schoolsReceivingDonations = schoolsReceivingDonations;
    }

    /**
     * Inner class for top selling products
     */
    public static class TopProductDto {
        private Long productId;
        private String productName;
        private String category;
        private Integer totalSold;
        private BigDecimal totalRevenue;

        // Constructors
        public TopProductDto() {}

        public TopProductDto(Long productId, String productName, String category, Integer totalSold, BigDecimal totalRevenue) {
            this.productId = productId;
            this.productName = productName;
            this.category = category;
            this.totalSold = totalSold;
            this.totalRevenue = totalRevenue;
        }

        // Getters and Setters
        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Integer getTotalSold() {
            return totalSold;
        }

        public void setTotalSold(Integer totalSold) {
            this.totalSold = totalSold;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }
}
