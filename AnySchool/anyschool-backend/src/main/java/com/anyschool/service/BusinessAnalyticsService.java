package com.anyschool.service;

import com.anyschool.dto.BusinessAnalyticsDto;
import com.anyschool.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Business Analytics Service
 * 
 * Generates comprehensive reports for:
 * - Platform metrics (schools, users, orders)
 * - Revenue and growth tracking
 * - Product performance
 * - Supplier negotiations
 */
@Service
@Transactional(readOnly = true)
public class BusinessAnalyticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StationeryRepository stationeryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    /**
     * Generate comprehensive business analytics report
     * Use this to show suppliers your platform's traction
     */
    public BusinessAnalyticsDto generateBusinessReport() {
        BusinessAnalyticsDto analytics = new BusinessAnalyticsDto();

        // Platform metrics
        analytics.setTotalSchools(Math.toIntExact(schoolRepository.count()));
        analytics.setTotalParents(Math.toIntExact(userRepository.countByRole("PARENT")));
        analytics.setTotalOrders(Math.toIntExact(orderRepository.count()));
        analytics.setTotalRevenue(calculateTotalRevenue());

        // Recent order metrics
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);

        analytics.setOrdersLast30Days(orderRepository.countByCreatedAtAfter(thirtyDaysAgo));
        analytics.setOrdersLast90Days(orderRepository.countByCreatedAtAfter(ninetyDaysAgo));
        analytics.setRevenueLast30Days(calculateRevenueAfterDate(thirtyDaysAgo));
        analytics.setRevenueLast90Days(calculateRevenueAfterDate(ninetyDaysAgo));

        // Average order value
        BigDecimal totalRev = analytics.getTotalRevenue();
        int totalOrders = analytics.getTotalOrders();
        if (totalOrders > 0) {
            analytics.setAverageOrderValue(totalRev.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP));
        }

        // Product metrics
        analytics.setTotalProducts(Math.toIntExact(stationeryRepository.count()));
        analytics.setTopSellingProducts(getTopSellingProducts(10));
        analytics.setProductsByCategory(getProductsByCategory());

        // Supplier metrics
        analytics.setTotalSuppliers(Math.toIntExact(supplierRepository.count()));
        analytics.setSuppliersByType(getSuppliersByType());

        // Growth projection
        analytics.setProjectedMonthlyOrders(projectMonthlyOrders(analytics.getOrdersLast30Days()));
        analytics.setMonthOverMonthGrowth(calculateGrowthRate(analytics.getOrdersLast30Days(), analytics.getOrdersLast90Days()));

        // Social impact
        analytics.setDonationOrders(orderRepository.countByOrderType("DONATION"));
        analytics.setTotalDonationValue(calculateDonationValue());
        analytics.setSchoolsReceivingDonations(countSchoolsWithDonations());

        return analytics;
    }

    /**
     * Calculate total revenue across all orders
     */
    private BigDecimal calculateTotalRevenue() {
        return orderRepository.findAll().stream()
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculate revenue after a specific date
     */
    private BigDecimal calculateRevenueAfterDate(LocalDateTime date) {
        return orderRepository.findByCreatedAtAfter(date).stream()
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Get top selling products
     */
    private List<BusinessAnalyticsDto.TopProductDto> getTopSellingProducts(int limit) {
        // This would require aggregating OrderItems by stationery
        // Simplified version - in production, use native query for better performance
        Map<Long, BusinessAnalyticsDto.TopProductDto> productSales = new HashMap<>();

        orderItemRepository.findAll().forEach(item -> {
            if (item.getStationery() != null) {
                Long productId = item.getStationery().getId();
                productSales.putIfAbsent(productId, new BusinessAnalyticsDto.TopProductDto(
                        productId,
                        item.getStationery().getName(),
                        item.getStationery().getCategory(),
                        0,
                        BigDecimal.ZERO
                ));

                BusinessAnalyticsDto.TopProductDto product = productSales.get(productId);
                product.setTotalSold(product.getTotalSold() + item.getQuantity());
                product.setTotalRevenue(product.getTotalRevenue().add(item.getSubtotal()));
            }
        });

        return productSales.values().stream()
                .sorted((a, b) -> b.getTotalSold().compareTo(a.getTotalSold()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get products grouped by category
     */
    private Map<String, Integer> getProductsByCategory() {
        Map<String, Integer> categories = new HashMap<>();
        stationeryRepository.findAll().forEach(product -> {
            String category = product.getCategory();
            categories.put(category, categories.getOrDefault(category, 0) + 1);
        });
        return categories;
    }

    /**
     * Get suppliers grouped by type
     */
    private Map<String, Integer> getSuppliersByType() {
        Map<String, Integer> types = new HashMap<>();
        supplierRepository.findAll().forEach(supplier -> {
            String type = supplier.getSupplierType();
            types.put(type, types.getOrDefault(type, 0) + 1);
        });
        return types;
    }

    /**
     * Project monthly orders based on trend
     */
    private Integer projectMonthlyOrders(int ordersLast30Days) {
        // Simple projection - in production, use more sophisticated forecasting
        return (int) (ordersLast30Days * 1.2); // 20% growth assumption
    }

    /**
     * Calculate growth rate
     */
    private String calculateGrowthRate(int recent, int older) {
        if (older == 0) return "N/A";
        int older30Days = (older - recent); // Orders from 60-90 days ago
        if (older30Days == 0) return "N/A";
        
        double growthRate = ((double) (recent - older30Days) / older30Days) * 100;
        return String.format("%.1f%%", growthRate);
    }

    /**
     * Calculate total donation value
     */
    private BigDecimal calculateDonationValue() {
        return orderRepository.findByOrderType("DONATION").stream()
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Count schools that have received donations
     */
    private Integer countSchoolsWithDonations() {
        return (int) orderRepository.findByOrderType("DONATION").stream()
                .map(order -> order.getSchool())
                .filter(Objects::nonNull)
                .map(school -> school.getId())
                .distinct()
                .count();
    }
}
