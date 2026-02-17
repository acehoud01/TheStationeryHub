package com.anyschool.repository;

import com.anyschool.model.Stationery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * StationeryRepository
 * 
 * Spring Data JPA repository for Stationery entity.
 * Provides CRUD operations and custom queries.
 * 
 * Spring Data JPA automatically provides implementation at runtime.
 * No need to write implementation code!
 * 
 * Built-in methods (from JpaRepository):
 * - save(Stationery stationery)
 * - findById(Long id)
 * - findAll()
 * - deleteById(Long id)
 * - count()
 * - existsById(Long id)
 * 
 * Custom methods:
 * - findByCategory(String category) - Find stationery items by category
 */
@Repository
public interface StationeryRepository extends JpaRepository<Stationery, Long> {

    /**
     * Find stationery items by category
     * 
     * Spring Data JPA generates the query automatically:
     * SELECT * FROM stationery WHERE category = ?
     * 
     * @param category Stationery category (e.g., "Pens", "Notebooks", "Backpacks")
     * @return List of stationery items in the specified category (empty list if none found)
     */
    List<Stationery> findByCategory(String category);
}
