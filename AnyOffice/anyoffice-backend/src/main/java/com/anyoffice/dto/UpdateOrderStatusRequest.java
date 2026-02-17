package com.anyoffice.dto;

public class UpdateOrderStatusRequest {
    private String status;
    private String rejectionReason;
    private String comments;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
