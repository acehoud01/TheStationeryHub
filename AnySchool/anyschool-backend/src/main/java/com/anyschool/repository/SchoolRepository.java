package com.anyschool.repository;

import com.anyschool.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SchoolRepository
 * 
 * Spring Data JPA repository for School entity.
 * Provides CRUD operations and custom queries.
 * 
 * Spring Data JPA automatically provides implementation at runtime.
 * No need to write implementation code!
 * 
 * Built-in methods (from JpaRepository):
 * - save(School school)
 * - findById(Long id)
 * - findAll()
 * - deleteById(Long id)
 * - count()
 * - existsById(Long id)
 * 
 * Custom methods:
 * - findByProvince(String province) - Find schools by province
 */
@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {

    /**
     * Find schools by province
     * 
     * Spring Data JPA generates the query automatically:
     * SELECT * FROM schools WHERE province = ?
     * 
     * @param province Province name
     * @return List of schools in the specified province (empty list if none found)
     */
    List<School> findByProvince(String province);
}
