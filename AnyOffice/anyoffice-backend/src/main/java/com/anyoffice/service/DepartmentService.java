package com.anyoffice.service;

import com.anyoffice.dto.CreateDepartmentRequest;
import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.Department;
import com.anyoffice.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public Department createDepartment(Long companyId, CreateDepartmentRequest req) {
        Department dept = new Department();
        dept.setCompanyId(companyId);
        dept.setName(req.getName().trim());
        dept.setCode(req.getCode());
        dept.setManagerId(req.getManagerId());
        dept.setMonthlyBudget(req.getMonthlyBudget());
        dept.setCostCenter(req.getCostCenter());
        dept.setActive(true);
        Department saved = departmentRepository.save(dept);
        log.info("Department created: {} for company {}", req.getName(), companyId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Department> getDepartmentsByCompany(Long companyId) {
        return departmentRepository.findByCompanyIdAndIsActiveTrue(companyId);
    }

    @Transactional(readOnly = true)
    public Department getDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional
    public Department updateDepartment(Long id, CreateDepartmentRequest req) {
        Department dept = getDepartment(id);
        if (req.getName() != null) dept.setName(req.getName().trim());
        if (req.getCode() != null) dept.setCode(req.getCode());
        if (req.getManagerId() != null) dept.setManagerId(req.getManagerId());
        if (req.getMonthlyBudget() != null) dept.setMonthlyBudget(req.getMonthlyBudget());
        if (req.getCostCenter() != null) dept.setCostCenter(req.getCostCenter());
        return departmentRepository.save(dept);
    }

    @Transactional
    public void deactivateDepartment(Long id) {
        Department dept = getDepartment(id);
        dept.setActive(false);
        departmentRepository.save(dept);
    }
}
