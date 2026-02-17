package com.anyoffice.repository;

import com.anyoffice.model.InventoryTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryTrackingRepository extends JpaRepository<InventoryTracking, Long> {
    List<InventoryTracking> findByCompanyId(Long companyId);
    Optional<InventoryTracking> findByStationeryIdAndCompanyId(Long stationeryId, Long companyId);
    List<InventoryTracking> findByCompanyIdAndCurrentStockLessThan(Long companyId, Integer threshold);
}
