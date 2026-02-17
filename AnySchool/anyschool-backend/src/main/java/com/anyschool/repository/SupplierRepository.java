package com.anyschool.repository;

import com.anyschool.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    /**
     * Find all active suppliers
     */
    List<Supplier> findByActiveTrue();
    
    /**
     * Find suppliers by type
     */
    List<Supplier> findBySupplierTypeAndActiveTrue(String supplierType);
    
    /**
     * Search suppliers by name
     */
    List<Supplier> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    
    /**
     * Count active suppliers by type
     */
    long countBySupplierTypeAndActiveTrue(String supplierType);
}
