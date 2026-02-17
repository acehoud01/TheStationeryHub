package com.anyoffice.dto;

import java.math.BigDecimal;

public class BudgetAllocationRequest {
    private Long departmentId;
    private Integer fiscalYear;
    private Integer fiscalQuarter;
    private BigDecimal allocatedAmount;
    private String category;

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(Integer fiscalYear) { this.fiscalYear = fiscalYear; }

    public Integer getFiscalQuarter() { return fiscalQuarter; }
    public void setFiscalQuarter(Integer fiscalQuarter) { this.fiscalQuarter = fiscalQuarter; }

    public BigDecimal getAllocatedAmount() { return allocatedAmount; }
    public void setAllocatedAmount(BigDecimal allocatedAmount) { this.allocatedAmount = allocatedAmount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
