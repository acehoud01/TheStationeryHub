package com.anyoffice.repository;

import com.anyoffice.model.BudgetAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {
    List<BudgetAllocation> findByCompanyIdAndFiscalYear(Long companyId, Integer fiscalYear);
    List<BudgetAllocation> findByCompanyId(Long companyId);
    Optional<BudgetAllocation> findByDepartmentIdAndFiscalYear(Long departmentId, Integer fiscalYear);
    Optional<BudgetAllocation> findByCompanyIdAndDepartmentIdAndFiscalYear(Long companyId, Long departmentId, Integer fiscalYear);
}
