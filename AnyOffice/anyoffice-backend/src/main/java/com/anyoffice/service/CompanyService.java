package com.anyoffice.service;

import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.Company;
import com.anyoffice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional
    public Company createCompany(String name, String industry, String address,
                                  String contactEmail, String contactPhone) {
        Company company = new Company();
        company.setName(name.trim());
        company.setIndustry(industry);
        company.setAddress(address);
        company.setContactEmail(contactEmail);
        company.setContactPhone(contactPhone);
        company.setActive(true);
        company.setSubscriptionTier("BASIC");
        Company saved = companyRepository.save(company);
        log.info("Company created: {}", name);
        return saved;
    }

    @Transactional(readOnly = true)
    public Company getCompany(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Company> getActiveCompanies() {
        return companyRepository.findByIsActiveTrue();
    }

    @Transactional
    public Company updateCompany(Long id, Map<String, Object> updates) {
        Company company = getCompany(id);
        if (updates.containsKey("name")) company.setName((String) updates.get("name"));
        if (updates.containsKey("industry")) company.setIndustry((String) updates.get("industry"));
        if (updates.containsKey("address")) company.setAddress((String) updates.get("address"));
        if (updates.containsKey("contactEmail")) company.setContactEmail((String) updates.get("contactEmail"));
        if (updates.containsKey("contactPhone")) company.setContactPhone((String) updates.get("contactPhone"));
        if (updates.containsKey("monthlyBudget")) {
            company.setMonthlyBudget(new BigDecimal(updates.get("monthlyBudget").toString()));
        }
        if (updates.containsKey("subscriptionTier")) company.setSubscriptionTier((String) updates.get("subscriptionTier"));
        return companyRepository.save(company);
    }

    @Transactional
    public void deactivateCompany(Long id) {
        Company company = getCompany(id);
        company.setActive(false);
        companyRepository.save(company);
        log.info("Company deactivated: {}", id);
    }
}
