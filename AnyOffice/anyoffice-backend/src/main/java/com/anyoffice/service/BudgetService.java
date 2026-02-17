package com.anyoffice.service;

import com.anyoffice.dto.BudgetAllocationRequest;
import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.BudgetAllocation;
import com.anyoffice.model.Department;
import com.anyoffice.repository.BudgetAllocationRepository;
import com.anyoffice.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetAllocationRepository budgetRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getBudgetSummary(Long companyId) {
        int currentYear = LocalDate.now().getYear();
        List<BudgetAllocation> allocations = budgetRepository.findByCompanyIdAndFiscalYear(companyId, currentYear);
        BigDecimal totalAllocated = allocations.stream()
                .map(BudgetAllocation::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = allocations.stream()
                .map(BudgetAllocation::getSpentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> summary = new HashMap<>();
        summary.put("fiscalYear", currentYear);
        summary.put("totalAllocated", totalAllocated);
        summary.put("totalSpent", totalSpent);
        summary.put("remaining", totalAllocated.subtract(totalSpent));
        summary.put("allocations", allocations);
        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDepartmentBudget(Long deptId) {
        Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        int currentYear = LocalDate.now().getYear();
        Optional<BudgetAllocation> allocation = budgetRepository.findByDepartmentIdAndFiscalYear(deptId, currentYear);
        Map<String, Object> result = new HashMap<>();
        result.put("departmentId", deptId);
        result.put("departmentName", dept.getName());
        result.put("monthlyBudget", dept.getMonthlyBudget());
        result.put("currentSpend", dept.getCurrentSpend());
        allocation.ifPresent(a -> {
            result.put("yearlyAllocated", a.getAllocatedAmount());
            result.put("yearlySpent", a.getSpentAmount());
            result.put("yearlyRemaining", a.getRemainingAmount());
        });
        return result;
    }

    @Transactional
    public BudgetAllocation allocateBudget(Long companyId, BudgetAllocationRequest req) {
        BudgetAllocation allocation = budgetRepository
                .findByCompanyIdAndDepartmentIdAndFiscalYear(companyId, req.getDepartmentId(), req.getFiscalYear())
                .orElse(new BudgetAllocation());
        allocation.setCompanyId(companyId);
        allocation.setDepartmentId(req.getDepartmentId());
        allocation.setFiscalYear(req.getFiscalYear());
        allocation.setFiscalQuarter(req.getFiscalQuarter());
        allocation.setAllocatedAmount(req.getAllocatedAmount());
        allocation.setCategory(req.getCategory());
        return budgetRepository.save(allocation);
    }

    @Transactional
    public void updateSpend(Long companyId, Long deptId, BigDecimal amount) {
        if (deptId != null) {
            departmentRepository.findById(deptId).ifPresent(dept -> {
                BigDecimal current = dept.getCurrentSpend() != null ? dept.getCurrentSpend() : BigDecimal.ZERO;
                dept.setCurrentSpend(current.add(amount));
                departmentRepository.save(dept);
            });
            int currentYear = LocalDate.now().getYear();
            budgetRepository.findByCompanyIdAndDepartmentIdAndFiscalYear(companyId, deptId, currentYear)
                    .ifPresent(allocation -> {
                        allocation.setSpentAmount(allocation.getSpentAmount().add(amount));
                        budgetRepository.save(allocation);
                    });
        }
    }
}
