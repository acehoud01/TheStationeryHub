package com.anyschool.service;

import com.anyschool.dto.SupplierDto;
import com.anyschool.exception.ResourceNotFoundException;
import com.anyschool.model.Supplier;
import com.anyschool.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    /**
     * Get all active suppliers
     */
    public List<SupplierDto> getAllActiveSuppliers() {
        List<Supplier> suppliers = supplierRepository.findByActiveTrue();
        return suppliers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get supplier by ID
     */
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return convertToDto(supplier);
    }

    /**
     * Get suppliers by type
     */
    public List<SupplierDto> getSuppliersByType(String type) {
        List<Supplier> suppliers = supplierRepository.findBySupplierTypeAndActiveTrue(type);
        return suppliers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search suppliers by name
     */
    public List<SupplierDto> searchSuppliers(String searchTerm) {
        List<Supplier> suppliers = supplierRepository.findByNameContainingIgnoreCaseAndActiveTrue(searchTerm);
        return suppliers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create new supplier
     */
    public SupplierDto createSupplier(SupplierDto supplierDto) {
        Supplier supplier = convertToEntity(supplierDto);
        supplier = supplierRepository.save(supplier);
        return convertToDto(supplier);
    }

    /**
     * Update existing supplier
     */
    public SupplierDto updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        // Update fields
        supplier.setName(supplierDto.getName());
        supplier.setContactPerson(supplierDto.getContactPerson());
        supplier.setEmail(supplierDto.getEmail());
        supplier.setPhone(supplierDto.getPhone());
        supplier.setAddress(supplierDto.getAddress());
        supplier.setSupplierType(supplierDto.getSupplierType());
        supplier.setNotes(supplierDto.getNotes());
        supplier.setActive(supplierDto.getActive());
        supplier.setPaymentTerms(supplierDto.getPaymentTerms());
        supplier.setMinimumOrderValue(supplierDto.getMinimumOrderValue());
        supplier.setDeliveryTime(supplierDto.getDeliveryTime());
        supplier.setContractStartDate(supplierDto.getContractStartDate());
        supplier.setContractEndDate(supplierDto.getContractEndDate());

        supplier = supplierRepository.save(supplier);
        return convertToDto(supplier);
    }

    /**
     * Deactivate supplier (soft delete)
     */
    public void deactivateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    /**
     * Delete supplier permanently
     */
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplierRepository.delete(supplier);
    }

    /**
     * Convert Supplier entity to DTO
     */
    private SupplierDto convertToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setSupplierType(supplier.getSupplierType());
        dto.setNotes(supplier.getNotes());
        dto.setActive(supplier.getActive());
        dto.setPaymentTerms(supplier.getPaymentTerms());
        dto.setMinimumOrderValue(supplier.getMinimumOrderValue());
        dto.setDeliveryTime(supplier.getDeliveryTime());
        dto.setContractStartDate(supplier.getContractStartDate());
        dto.setContractEndDate(supplier.getContractEndDate());
        dto.setProductCount(supplier.getProducts() != null ? supplier.getProducts().size() : 0);
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        return dto;
    }

    /**
     * Convert DTO to Supplier entity
     */
    private Supplier convertToEntity(SupplierDto dto) {
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setSupplierType(dto.getSupplierType());
        supplier.setNotes(dto.getNotes());
        supplier.setActive(dto.getActive() != null ? dto.getActive() : true);
        supplier.setPaymentTerms(dto.getPaymentTerms());
        supplier.setMinimumOrderValue(dto.getMinimumOrderValue());
        supplier.setDeliveryTime(dto.getDeliveryTime());
        supplier.setContractStartDate(dto.getContractStartDate());
        supplier.setContractEndDate(dto.getContractEndDate());
        return supplier;
    }
}
