package com.anyoffice.repository;

import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeUserRepository extends JpaRepository<OfficeUser, Long> {
    Optional<OfficeUser> findByEmail(String email);
    List<OfficeUser> findByCompanyId(Long companyId);
    List<OfficeUser> findByDepartmentId(Long departmentId);
    List<OfficeUser> findByCompanyIdAndRole(Long companyId, OfficeUserRole role);
    List<OfficeUser> findByCompanyIdAndIsEnabledTrue(Long companyId);
    boolean existsByEmail(String email);
    long countByCompanyId(Long companyId);
}
