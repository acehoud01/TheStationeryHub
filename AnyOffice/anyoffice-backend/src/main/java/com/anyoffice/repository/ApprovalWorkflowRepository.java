package com.anyoffice.repository;

import com.anyoffice.model.ApprovalWorkflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, Long> {
    List<ApprovalWorkflow> findByOrderId(Long orderId);
    List<ApprovalWorkflow> findByApproverIdAndStatus(Long approverId, String status);
    Optional<ApprovalWorkflow> findByOrderIdAndStatus(Long orderId, String status);
    List<ApprovalWorkflow> findByApproverIdOrderByCreatedAtDesc(Long approverId);
}
