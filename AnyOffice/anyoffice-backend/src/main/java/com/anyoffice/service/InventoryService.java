package com.anyoffice.service;

import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.InventoryTracking;
import com.anyoffice.repository.InventoryTrackingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryTrackingRepository inventoryRepository;

    @Transactional(readOnly = true)
    public List<InventoryTracking> getInventoryByCompany(Long companyId) {
        return inventoryRepository.findByCompanyId(companyId);
    }

    @Transactional
    public InventoryTracking updateInventory(Long id, Map<String, Object> updates) {
        InventoryTracking inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory record not found"));
        if (updates.containsKey("currentStock")) {
            inventory.setCurrentStock(Integer.valueOf(updates.get("currentStock").toString()));
        }
        if (updates.containsKey("location")) {
            inventory.setLocation((String) updates.get("location"));
        }
        if (updates.containsKey("autoReorderEnabled")) {
            inventory.setAutoReorderEnabled(Boolean.valueOf(updates.get("autoReorderEnabled").toString()));
        }
        if (updates.containsKey("lastRestockedQuantity")) {
            int qty = Integer.valueOf(updates.get("lastRestockedQuantity").toString());
            inventory.setLastRestockedQuantity(qty);
            inventory.setLastRestockedDate(LocalDate.now());
            int current = inventory.getCurrentStock() != null ? inventory.getCurrentStock() : 0;
            inventory.setCurrentStock(current + qty);
        }
        return inventoryRepository.save(inventory);
    }

    @Transactional
    public InventoryTracking createOrUpdate(Long companyId, Long stationeryId, int quantity) {
        InventoryTracking inv = inventoryRepository
                .findByStationeryIdAndCompanyId(stationeryId, companyId)
                .orElse(new InventoryTracking());
        inv.setCompanyId(companyId);
        inv.setStationeryId(stationeryId);
        int current = inv.getCurrentStock() != null ? inv.getCurrentStock() : 0;
        inv.setCurrentStock(Math.max(0, current - quantity));
        return inventoryRepository.save(inv);
    }

    @Transactional(readOnly = true)
    public List<InventoryTracking> getLowStockItems(Long companyId, int threshold) {
        return inventoryRepository.findByCompanyIdAndCurrentStockLessThan(companyId, threshold);
    }
}
