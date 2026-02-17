# Purchasing Admin Workflow Guide

## Overview

The Purchasing Admin workflow has been redesigned to provide better control and visibility throughout the order fulfillment process. This document outlines the complete workflow from order placement to closure.

---

## Workflow Steps

### 1. **New Order Alert** (Status: `APPROVED`)

When a parent, school admin, or donor completes payment:
- Order status automatically changes from `PENDING` → `APPROVED`
- Purchasing admin receives a popup alert with order details:
  - **For Donations**: "New donation order from [Donor Name] for [School Name]"
  - **For Parent Orders**: "New order from [Parent Name] for [Student Name] at [School Name]"
  - **For School Orders**: "New order from [School Name] - School order placed by admin"

**Action Required**: Acknowledge the order

---

### 2. **Acknowledge Order** (Status: `APPROVED` → `ACKNOWLEDGED`)

Purchasing admin reviews the order and clicks "Acknowledge Order"
- Order status changes to `ACKNOWLEDGED`
- User sees: "Order Sent" → "Order Acknowledged"

**What this means**: The purchasing admin has seen the order and is reviewing it

---

### 3. **Start Processing**

#### 3a. **Check Order Amount**

When purchasing admin clicks "Start Processing":

**If Order Amount < R1000**:
- Order status changes to `IN_PROCESS`
- User sees: "Order Acknowledged" → "Order in Process"
- Purchasing admin proceeds directly to processing

**If Order Amount ≥ R1000**:
- Order is sent to Super Admin for approval
- Order remains `ACKNOWLEDGED` but marked for approval
- User sees message: "Order sent to Super Admin for approval (amount >= R1000)"
- Workflow pauses until Super Admin approves
- Once approved by Super Admin, status changes to `IN_PROCESS`

---

### 4. **Verify Payment** (Status: `IN_PROCESS` → `FINALIZING`)

Once the order is being processed, purchasing admin verifies payment completion:
- Clicks "Verify Payment"
- Order status changes to `FINALIZING`
- User sees: "Order in Process" → "Finalizing the Order"

**What this means**: Payment has been confirmed and order is being finalized for delivery

---

### 5. **Send for Delivery** (Status: `FINALIZING` → `OUT_FOR_DELIVERY`)

When order is ready for delivery:
- Purchasing admin clicks "Send for Delivery"
- Order status changes to `OUT_FOR_DELIVERY`
- User sees: "Finalizing the Order" → "Out for Delivery"
- Optional: Add delivery notes (tracking number, courier info, etc.)

---

### 6. **Mark as Delivered** (Status: `OUT_FOR_DELIVERY` → `DELIVERED`)

When delivery is confirmed:
- Purchasing admin clicks "Mark as Delivered"
- Order status changes to `DELIVERED`
- User sees: "Out for Delivery" → "Order Delivered"

---

### 7. **Close Order** (Status: `DELIVERED` → `CLOSED`)

Final step to complete the transaction:
- Purchasing admin clicks "Close Order"
- Order status changes to `CLOSED`
- Order is marked as final (cannot be modified)
- User sees: "Order Delivered" → "Closed"

**What this means**: Transaction is complete and the order is archived

---

## Order Status Labels (User-Facing)

| Backend Status | User Sees |
|---------------|-----------|
| `PENDING` | Awaiting Payment |
| `APPROVED` | Order Sent |
| `ACKNOWLEDGED` | Order Acknowledged |
| `IN_PROCESS` | Order in Process |
| `FINALIZING` | Finalizing Order |
| `OUT_FOR_DELIVERY` | Out for Delivery |
| `DELIVERED` | Order Delivered |
| `CLOSED` | Closed |
| `DECLINED` | Declined |
| `CANCELLED` | Cancelled |

---

## API Endpoints

### New Workflow Endpoints

```
GET    /api/purchasing/orders/new              - Get all new orders (APPROVED status)
POST   /api/purchasing/orders/{id}/acknowledge - Acknowledge order
POST   /api/purchasing/orders/{id}/start-processing - Start processing (checks amount)
POST   /api/purchasing/orders/{id}/verify-payment - Verify payment
POST   /api/purchasing/orders/{id}/send-for-delivery - Send for delivery
POST   /api/purchasing/orders/{id}/mark-delivered - Mark as delivered
POST   /api/purchasing/orders/{id}/close - Close order
```

### Legacy Endpoint (Still Supported)

```
PUT    /api/purchasing/orders/{id}/status      - Update status (generic)
```

---

## Dashboard Stats

The Purchasing Admin Dashboard displays:
- **New Orders**: Orders awaiting acknowledgment (`APPROVED`)
- **Acknowledged**: Orders that have been acknowledged (`ACKNOWLEDGED`)
- **In Process**: Orders currently being processed (`IN_PROCESS` + `FINALIZING` + `OUT_FOR_DELIVERY`)
- **Closed**: Completed orders (`DELIVERED` + `CLOSED`)

---

## Super Admin Approval (Orders ≥ R1000)

For orders with total amount ≥ R1000:
1. Purchasing admin clicks "Start Processing"
2. System automatically detects amount
3. Order is flagged for Super Admin review
4. Super Admin sees order in approval queue
5. Super Admin approves/declines order
6. If approved: Order proceeds to `IN_PROCESS`
7. If declined: Order status changes to `DECLINED`

---

## Alert System

### New Order Alert Component

Displays on Purchasing Admin dashboard login:
- Shows count of new orders
- Lists order details (donor/parent/school name, student info, amount)
- Color-coded badges:
  - 🟢 **DONATION**: Green
  - 🔵 **PARENT**: Blue
  - ⚪ **SCHOOL**: Grey
- Dismisses on "View Orders" button click

---

## Database Changes

### Migration V6 (Applied)

```sql
-- Update existing statuses to new workflow
UPDATE orders SET status = 'CLOSED' WHERE status = 'COMPLETED';
UPDATE orders SET status = 'IN_PROCESS' WHERE status = 'PURCHASE_IN_PROGRESS';
UPDATE orders SET status = 'FINALIZING' WHERE status = 'PACKAGED';

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

---

## Legacy Status Migration

Old statuses are automatically mapped:
- `COMPLETED` → `CLOSED`
- `PURCHASE_IN_PROGRESS` → `IN_PROCESS`
- `PACKAGED` → `FINALIZING`

Legacy statuses are marked as `@Deprecated` in the enum but still supported for backward compatibility.

---

## Troubleshooting

### Order stuck in APPROVED
- Check if purchasing admin dismissed the alert
- Verify order appears in "New Orders" tab
- Admin needs to click "Acknowledge Order"

### Order not proceeding to IN_PROCESS
- Check if order amount ≥ R1000
- If yes, order needs Super Admin approval first
- Check Super Admin approval queue

### Payment verification failed
- Verify order is in IN_PROCESS status
- Check payment reference is present
- Ensure order was paid before processing

---

## Testing Checklist

- [ ] Parent places order → Status: APPROVED
- [ ] School admin places order → Status: APPROVED
- [ ] Donor makes donation → Status: APPROVED
- [ ] New order alert appears on purchasing admin login
- [ ] Alert shows correct customer/donor info
- [ ] Acknowledge order → Status: ACKNOWLEDGED
- [ ] Start processing (< R1000) → Status: IN_PROCESS
- [ ] Start processing (≥ R1000) → Sent to Super Admin
- [ ] Super Admin approves → Status: IN_PROCESS
- [ ] Verify payment → Status: FINALIZING
- [ ] Send for delivery → Status: OUT_FOR_DELIVERY
- [ ] Mark delivered → Status: DELIVERED
- [ ] Close order → Status: CLOSED

---

## Implementation Date

**February 14, 2026**

---

## Files Modified

### Backend
- `OrderStatus.java` - Added new statuses
- `V6__update_order_workflow_statuses.sql` - Database migration
- `PurchasingAdminController.java` - New workflow endpoints
- `OrderController.java` - Updated error messages
- `AdminController.java` - Updated error messages

### Frontend
- `NewOrderAlert.jsx` - New order alert component
- `PurchasingAdminDashboardPage.jsx` - Updated workflow UI
- `api.js` - Added new endpoint configurations
- `PaymentPage.jsx` - Updated status color mapping
- `PaymentSuccessPage.jsx` - Updated status color mapping
- `OrderDetailPage.jsx` - Updated status handling
- `DonorDashboardPage.jsx` - Updated completed status check

---

## Contact

For questions or issues with the workflow, contact the development team.
