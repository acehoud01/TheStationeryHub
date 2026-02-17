package com.anyoffice.repository;

import com.anyoffice.model.OfficeOrder;
import com.anyoffice.model.OfficeOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficeOrderRepository extends JpaRepository<OfficeOrder, Long> {
    Optional<OfficeOrder> findByOrderNumber(String orderNumber);
    List<OfficeOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<OfficeOrder> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<OfficeOrder> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, OfficeOrderStatus status);
    List<OfficeOrder> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<OfficeOrder> findByStatusOrderByCreatedAtDesc(OfficeOrderStatus status);
    long countByCompanyId(Long companyId);
    long countByCompanyIdAndStatus(Long companyId, OfficeOrderStatus status);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM OfficeOrder o WHERE o.companyId = :companyId AND o.status IN ('APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED')")
    BigDecimal sumApprovedOrdersByCompany(@Param("companyId") Long companyId);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM OfficeOrder o WHERE o.companyId = :companyId AND o.createdAt >= :since AND o.status NOT IN ('CANCELLED', 'REJECTED')")
    BigDecimal sumOrdersByCompanySince(@Param("companyId") Long companyId, @Param("since") LocalDateTime since);

    List<OfficeOrder> findByCompanyIdAndCreatedAtAfterOrderByCreatedAtDesc(Long companyId, LocalDateTime after);
}
