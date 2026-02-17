package com.anyoffice.service;

import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.Stationery;
import com.anyoffice.repository.StationeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogService {

    private final StationeryRepository stationeryRepository;

    @Transactional(readOnly = true)
    public List<Stationery> getAllAvailable() {
        return stationeryRepository.findByAvailableTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Stationery getById(Long id) {
        return stationeryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Stationery> getByCategory(String category) {
        return stationeryRepository.findByCategoryAndAvailableTrue(category);
    }

    @Transactional(readOnly = true)
    public List<Stationery> search(String query) {
        return stationeryRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .filter(s -> Boolean.TRUE.equals(s.getAvailable()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return stationeryRepository.findByAvailableTrue()
                .stream()
                .map(Stationery::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}
