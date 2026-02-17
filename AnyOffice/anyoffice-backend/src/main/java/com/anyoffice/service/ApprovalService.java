package com.anyoffice.service;

import com.anyoffice.exception.ResourceNotFoundException;
import com.anyoffice.model.*;
import com.anyoffice.repository.ApprovalWorkflowRepository;
import com.anyoffice.repository.OfficeOrderRepository;
import com.anyoffice.repository.OfficeUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApprovalService {

    private final ApprovalWorkflowRepository workflowRepository;
    private final OfficeOrderRepository orderRepository;
    private final OfficeUserRepository userRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<ApprovalWorkflow> getPendingApprovalsForUser(OfficeUser approver) {
        return workflowRepository.findByApproverIdAndStatus(approver.getId(), "PENDING");
    }

    @Transactional
    public OfficeOrder approveOrder(Long workflowId, String comments, OfficeUser approver) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval workflow not found"));

        if (!workflow.getApproverId().equals(approver.getId()) &&
                approver.getRole() != OfficeUserRole.SUPER_ADMIN &&
                approver.getRole() != OfficeUserRole.COMPANY_ADMIN) {
            throw new IllegalArgumentException("You are not authorized to approve this order");
        }

        workflow.setStatus("APPROVED");
        workflow.setComments(comments);
        workflow.setApprovedAt(LocalDateTime.now());
        workflowRepository.save(workflow);

        OfficeOrder order = orderRepository.findById(workflow.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(OfficeOrderStatus.APPROVED);
        order.setApprovedBy(approver.getId());
        order.setApprovedAt(LocalDateTime.now());
        OfficeOrder saved = orderRepository.save(order);

        // Notify requester
        userRepository.findById(order.getUserId()).ifPresent(requester -> {
            emailService.sendOrderNotification(
                    requester.getEmail(), requester.getFirstName(),
                    order.getOrderNumber(), "APPROVED",
                    "Your order has been approved by " + approver.getFirstName() + " " + approver.getLastName()
            );
        });

        log.info("Order {} approved by {}", order.getOrderNumber(), approver.getEmail());
        return saved;
    }

    @Transactional
    public OfficeOrder rejectOrder(Long workflowId, String reason, OfficeUser approver) {
        ApprovalWorkflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new ResourceNotFoundException("Approval workflow not found"));

        workflow.setStatus("REJECTED");
        workflow.setComments(reason);
        workflow.setApprovedAt(LocalDateTime.now());
        workflowRepository.save(workflow);

        OfficeOrder order = orderRepository.findById(workflow.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(OfficeOrderStatus.REJECTED);
        order.setRejectionReason(reason);
        OfficeOrder saved = orderRepository.save(order);

        userRepository.findById(order.getUserId()).ifPresent(requester -> {
            emailService.sendOrderNotification(
                    requester.getEmail(), requester.getFirstName(),
                    order.getOrderNumber(), "REJECTED",
                    "Reason: " + reason
            );
        });

        log.info("Order {} rejected by {}", order.getOrderNumber(), approver.getEmail());
        return saved;
    }
}
