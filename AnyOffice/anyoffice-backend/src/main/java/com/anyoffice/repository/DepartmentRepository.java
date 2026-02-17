package com.anyoffice.repository;

import com.anyoffice.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByCompanyId(Long companyId);
    List<Department> findByCompanyIdAndIsActiveTrue(Long companyId);
    Optional<Department> findByCompanyIdAndCode(Long companyId, String code);
    long countByCompanyId(Long companyId);
}
