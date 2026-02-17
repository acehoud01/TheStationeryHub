package com.anyoffice.repository;

import com.anyoffice.model.Stationery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationeryRepository extends JpaRepository<Stationery, Long> {
    List<Stationery> findByAvailableTrue();
    List<Stationery> findByCategory(String category);
    List<Stationery> findByNameContainingIgnoreCase(String name);
    List<Stationery> findByAvailableTrueOrderByNameAsc();
    List<Stationery> findByCategoryAndAvailableTrue(String category);
}
