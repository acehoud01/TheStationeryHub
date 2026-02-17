package com.anyoffice.dto;

import java.util.List;

public class CreateOrderRequest {
    private Long departmentId;
    private String shippingAddress;
    private String deliveryNotes;
    private String priority = "MEDIUM";
    private String paymentMethod = "COMPANY_ACCOUNT";
    private List<OrderItemRequest> items;

    public static class OrderItemRequest {
        private Long stationeryId;
        private Integer quantity;
        private String notes;

        public Long getStationeryId() { return stationeryId; }
        public void setStationeryId(Long stationeryId) { this.stationeryId = stationeryId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getDeliveryNotes() { return deliveryNotes; }
    public void setDeliveryNotes(String deliveryNotes) { this.deliveryNotes = deliveryNotes; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
