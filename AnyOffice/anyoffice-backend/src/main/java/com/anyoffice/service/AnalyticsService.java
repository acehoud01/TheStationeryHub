package com.anyoffice.service;

import com.anyoffice.model.OfficeOrder;
import com.anyoffice.model.OfficeOrderStatus;
import com.anyoffice.repository.OfficeOrderRepository;
import com.anyoffice.repository.OfficeUserRepository;
import com.anyoffice.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final OfficeOrderRepository orderRepository;
    private final OfficeUserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardData(Long companyId) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);

        long totalOrders = orderRepository.countByCompanyId(companyId);
        long pendingApprovals = orderRepository.countByCompanyIdAndStatus(companyId, OfficeOrderStatus.PENDING_APPROVAL);
        BigDecimal monthSpend = orderRepository.sumOrdersByCompanySince(companyId, monthStart);
        long totalEmployees = userRepository.countByCompanyId(companyId);
        long totalDepartments = departmentRepository.countByCompanyId(companyId);

        List<OfficeOrder> recentOrders = orderRepository
                .findByCompanyIdAndCreatedAtAfterOrderByCreatedAtDesc(companyId, monthStart);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OfficeOrderStatus s : OfficeOrderStatus.values()) {
            ordersByStatus.put(s.name(), orderRepository.countByCompanyIdAndStatus(companyId, s));
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalOrders", totalOrders);
        dashboard.put("pendingApprovals", pendingApprovals);
        dashboard.put("monthlySpend", monthSpend != null ? monthSpend : BigDecimal.ZERO);
        dashboard.put("totalEmployees", totalEmployees);
        dashboard.put("totalDepartments", totalDepartments);
        dashboard.put("ordersByStatus", ordersByStatus);
        dashboard.put("recentOrderCount", recentOrders.size());
        return dashboard;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSpendAnalytics(Long companyId) {
        List<OfficeOrder> allOrders = orderRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        BigDecimal totalSpend = allOrders.stream()
                .filter(o -> o.getStatus() != OfficeOrderStatus.CANCELLED && o.getStatus() != OfficeOrderStatus.REJECTED)
                .map(OfficeOrder::getGrandTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalSpend", totalSpend);
        analytics.put("totalOrders", allOrders.size());
        analytics.put("averageOrderValue", allOrders.isEmpty() ? BigDecimal.ZERO :
                totalSpend.divide(BigDecimal.valueOf(allOrders.size()), 2, java.math.RoundingMode.HALF_UP));
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderAnalytics(Long companyId) {
        List<OfficeOrder> allOrders = orderRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        Map<String, Long> byStatus = allOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getStatus().name(), Collectors.counting()));
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("byStatus", byStatus);
        analytics.put("total", allOrders.size());
        return analytics;
    }
}
