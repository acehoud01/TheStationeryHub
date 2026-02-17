package com.anyschool.repository;

import com.anyschool.model.StationeryBundle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * StationeryBundleRepository
 * 
 * Spring Data JPA repository for StationeryBundle entity.
 * Provides CRUD operations and custom queries for bundle management.
 */
@Repository
public interface StationeryBundleRepository extends JpaRepository<StationeryBundle, Long> {

    /**
     * Find all bundles for a specific school
     * 
     * @param schoolId School ID
     * @return List of bundles for the school
     */
    List<StationeryBundle> findBySchoolIdOrderByGrade(Long schoolId);

    /**
     * Find bundles for a school and specific grade
     * 
     * @param schoolId School ID
     * @param grade Grade level
     * @return List of bundles for the school and grade
     */
    List<StationeryBundle> findBySchoolIdAndGrade(Long schoolId, String grade);

    /**
     * Find finalized bundles for a school
     * 
     * @param schoolId School ID
     * @param isFinalized Whether bundle is finalized
     * @return List of finalized bundles
     */
    List<StationeryBundle> findBySchoolIdAndIsFinalized(Long schoolId, Boolean isFinalized);
}
