# AnySchool → AnyOffice: Migration Mapping 🔄

**Reference guide for converting AnySchool concepts to AnyOffice**

This document helps you understand how to adapt AnySchool's existing patterns for AnyOffice.

---

## 🎯 BUSINESS DOMAIN MAPPING

| AnySchool Concept | AnyOffice Concept | Notes |
|-------------------|-------------------|-------|
| **Schools** | **Companies** | Organizations using the platform |
| **Children** | **Employees** | End users placing orders |
| **Parents** | **Department Managers** | Approve and manage users |
| **School Admin** | **Company Admin** | Manage organization |
| **Donors** | **_Not applicable_** | Budget comes from company |
| **School Stationery** | **Office Supplies** | Broader product range |
| **Grade/Class** | **Department** | Organizational unit |
| **School Events** | **_Optional: Company Announcements_** | Lower priority |
| **Sponsorship** | **Budget Allocation** | Different funding model |

---

## 👥 USER ROLES MAPPING

| AnySchool Role | AnyOffice Equivalent | Permissions |
|----------------|---------------------|-------------|
| **SUPER_ADMIN** | **SUPER_ADMIN** | Platform-wide control ✅ |
| **SCHOOL_ADMIN** | **COMPANY_ADMIN** | Manage company, employees, budgets |
| **PARENT** | **DEPARTMENT_MANAGER** | Approve orders, manage department budget |
| **DONOR** | **PROCUREMENT_OFFICER** | Manage suppliers, approve high-value orders |
| **CHILD** (implicit) | **EMPLOYEE** | Place orders, view own orders |

**New Role Unique to AnyOffice:**
- **PROCUREMENT_OFFICER**: Manages suppliers, processes orders, tracks inventory

---

## 📦 DATA MODEL MAPPING

### 1. User Entity

**AnySchool:**
```java
User {
  id, email, password
  firstName, lastName, phoneNumber
  role: SUPER_ADMIN, SCHOOL_ADMIN, PARENT, DONOR
  schoolId (for school admin)
}
```

**AnyOffice:**
```java
User {
  id, email, password
  firstName, lastName, phoneNumber
  role: SUPER_ADMIN, COMPANY_ADMIN, PROCUREMENT_OFFICER, 
        DEPARTMENT_MANAGER, EMPLOYEE
  companyId  // NEW: Link to company
  departmentId  // NEW: Link to department
  accountLocked, failedLoginAttempts, lockoutEndTime  // Same
}
```

---

### 2. Organization Entity

**AnySchool (School):**
```java
School {
  id, name
  address, city, province, postalCode
  contactEmail, contactPhone
  principalName
  numberOfStudents
  isActive
}
```

**AnyOffice (Company):**
```java
Company {
  id, name
  registrationNumber  // NEW: Business registration
  taxNumber  // NEW: Tax ID
  industry  // NEW: Industry type
  numberOfEmployees  // Similar to numberOfStudents
  address, city, state, postalCode, country
  contactEmail, contactPhone
  logoUrl
  isActive
  subscriptionTier  // NEW: BASIC, PROFESSIONAL, ENTERPRISE
  subscriptionStartDate, subscriptionEndDate  // NEW: Subscription tracking
  monthlyBudget  // NEW: Company-wide budget
}
```

---

### 3. Sub-Organization Entity

**AnySchool (Child):**
```java
Child {
  id, firstName, lastName
  gradeLevel  // Grade or class
  schoolId
  parentId
  hasRequirements  // Needs stationery
}
```

**AnyOffice (Department):**
```java
Department {
  id, name
  code  // Department code (e.g., "ENG", "MKT")
  companyId
  managerId  // Department manager (similar to parentId)
  monthlyBudget  // NEW: Department budget
  currentSpend  // NEW: Budget tracking
  costCenter  // NEW: For accounting
  isActive
}
```

---

### 4. Product Entity

**AnySchool (Stationery):**
```java
Stationery {
  id, name, sku
  category  // Limited: WRITING, PAPER, SCHOOL_SUPPLIES, etc.
  description
  price
  stockLevel
  imageUrl
  supplierId
  isActive
}
```

**AnyOffice (OfficeProduct):**
```java
OfficeProduct {
  id, name, sku
  category  // EXPANDED: WRITING, PAPER, FILING, TECHNOLOGY, 
            // FURNITURE, CLEANING, BREAKROOM, SAFETY, MISC
  subcategory  // NEW: Finer categorization
  description
  unitPrice
  currency
  unit  // NEW: "piece", "box", "ream"
  quantityPerUnit  // NEW: For bulk items
  stockLevel
  reorderLevel  // NEW: Auto-reorder threshold
  minimumOrderQuantity  // NEW: MOQ
  volumeDiscounts  // NEW: JSON for bulk pricing
  imageUrl
  supplierId
  isActive
  isFeatured  // Same
  tags  // NEW: Search tags
}
```

---

### 5. Order Entity

**AnySchool (Order):**
```java
Order {
  id, orderNumber
  userId  // Parent who placed order
  childId  // For whom the order is placed
  schoolId
  status: PENDING, APPROVED, PROCESSING, SHIPPED, 
          DELIVERED, CANCELLED, RETURNED
  orderDate
  totalAmount, shippingCost, grandTotal
  shippingAddress
  deliveryDate
  paymentStatus
  paymentsReceived  // For installments
  installmentPlan
}
```

**AnyOffice (Order):**
```java
Order {
  id, orderNumber  // Format: AO-YYYYMMDD-XXXXX
  userId  // Employee who placed order
  companyId
  departmentId  // NEW: Track by department
  status: PENDING_APPROVAL, APPROVED, REJECTED,  // NEW: Approval status
          PROCESSING, SHIPPED, DELIVERED, 
          CANCELLED, RETURNED
  orderDate
  approvedBy  // NEW: Manager who approved
  approvedAt, rejectionReason  // NEW: Approval tracking
  totalAmount, taxAmount, shippingCost, grandTotal
  shippingAddress
  deliveryNotes
  expectedDeliveryDate, actualDeliveryDate
  purchaseOrderNumber  // NEW: PO number
  invoiceNumber  // NEW: Invoice tracking
  paymentStatus: PENDING, PAID, PARTIALLY_PAID
  paymentMethod  // NEW: COMPANY_ACCOUNT, PURCHASE_ORDER, CREDIT_CARD
  priority  // NEW: LOW, MEDIUM, HIGH, URGENT
}
```

---

### 6. Supplier Entity

**Both platforms use similar Supplier model:**

```java
Supplier {
  id, name
  registrationNumber  // More important for B2B
  email, phone, address
  contactPersonName, contactPersonEmail, contactPersonPhone
  paymentTerms  // NEW: "Net 30", "Net 60"
  deliveryLeadTime  // NEW: Days for delivery
  minimumOrderValue  // NEW: Minimum order amount
  rating
  isActive
}
```

**AnyOffice adds more B2B features:**
- Contract management (future)
- Volume pricing agreements
- Multiple delivery locations

---

### 7. NEW ENTITIES (AnyOffice Only)

**ApprovalWorkflow:**
```java
ApprovalWorkflow {
  id
  orderId
  requesterId
  approverId
  level  // For multi-level approvals
  status: PENDING, APPROVED, REJECTED
  comments
  approvedAt
  createdAt
}
```

**BudgetAllocation:**
```java
BudgetAllocation {
  id
  companyId
  departmentId
  fiscalYear, fiscalQuarter
  allocatedAmount
  spentAmount
  remainingAmount
  category  // Optional: category-specific budgets
}
```

**InventoryTracking:**
```java
InventoryTracking {
  id
  productId
  companyId
  departmentId
  currentStock
  location
  lastRestockedDate, lastRestockedQuantity
  averageMonthlyConsumption
  projectedDepletionDate
  autoReorderEnabled
}
```

---

## 🔄 WORKFLOW MAPPING

### Ordering Workflow

**AnySchool:**
```
1. Parent browses catalog
2. Parent adds items to cart for child
3. Parent checks out
4. School verifies and approves order
5. Payment (upfront or installments)
6. Order processed and shipped to school
7. School distributes to child
```

**AnyOffice:**
```
1. Employee browses catalog
2. Employee adds items to cart
3. Employee checks out (checks against department budget)
4. APPROVAL WORKFLOW:
   - < R5,000: Auto-approved or manager approval
   - R5,000-R20,000: Department Manager approval
   - R20,000-R50,000: Procurement Officer approval
   - > R50,000: Multi-level (Manager + Procurement + Admin)
5. Approved order sent to supplier
6. Procurement officer tracks order
7. Order shipped to company/department location
8. Payment processed (invoice, PO, or company credit)
```

**Key Differences:**
- ✨ **Multi-level approval workflow** (based on order value)
- ✨ **Budget validation** at checkout
- ✨ **Procurement officer** manages order processing
- ✨ **Invoice/PO payment** instead of upfront payment

---

### Budget Management Workflow

**AnySchool:**
```
- Parent funds their child's account (deposit or sponsorship)
- Donor sponsors child's stationery
- Payment per order
```

**AnyOffice:**
```
1. Company Admin allocates budget to departments (quarterly/annually)
2. Department Manager manages department budget
3. Budget checked before order placement
4. Budget deducted upon order approval
5. Real-time budget tracking
6. Alerts when budget reaches 80%, 100%
7. Budget reallocation if needed
```

**Key Differences:**
- ✨ **Pre-allocated budgets** (not pay-per-order)
- ✨ **Department-level budget control**
- ✨ **Real-time tracking and alerts**
- ✨ **Budget forecasting**

---

## 🎨 UI/UX DIFFERENCES

### AnySchool Focus
- 👪 **Family-friendly**: Colorful, simple, accessible
- 🎒 **Education-centric**: School themes, back-to-school
- 💝 **Donation-driven**: Emphasize helping children

### AnyOffice Focus
- 💼 **Professional**: Clean, business-like, efficient
- 📊 **Data-driven**: Charts, analytics, metrics
- ⚡ **Efficiency-focused**: Bulk actions, quick approvals

---

## 📱 DASHBOARD COMPARISON

### AnySchool Dashboards

1. **Parent Dashboard:**
   - Children's accounts
   - Sponsored children
   - Order history
   - Pending payments

2. **School Dashboard:**
   - Student lists
   - Order management
   - Communications

3. **Donor Dashboard:**
   - Sponsored children
   - Donation history
   - Impact metrics

### AnyOffice Dashboards

1. **Employee Dashboard:**
   - Quick order stats
   - Recent orders
   - Budget remaining
   - Featured products

2. **Department Manager Dashboard:**
   - Pending approvals ⭐
   - Department budget status ⭐
   - Team orders
   - Quick approve/reject ⭐

3. **Procurement Officer Dashboard:**
   - Orders to process ⭐
   - Low stock alerts ⭐
   - Supplier performance ⭐
   - Approval queue ⭐

4. **Company Admin Dashboard:**
   - Company-wide analytics ⭐
   - Budget overview (all departments) ⭐
   - Employee management
   - System activity

**⭐ = New features unique to AnyOffice**

---

## 🛒 CART & CHECKOUT DIFFERENCES

### AnySchool Checkout
```
1. Review items
2. Select child (if multiple children)
3. Enter delivery address
4. Select payment method:
   - Pay from balance
   - Pay with card
   - Request sponsorship
5. Choose installment plan (if applicable)
6. Submit order
```

### AnyOffice Checkout
```
1. Review items
2. See volume discounts applied ⭐
3. Check budget availability ⭐
4. Select department (if multi-department)
5. Enter delivery address (company location)
6. Add delivery notes
7. Select priority level ⭐
8. Review approval requirements ⭐
9. Submit for approval
```

---

## 🔐 AUTHENTICATION DIFFERENCES

### Similar Features
✅ Email + Password login
✅ OTP verification
✅ Account lockout (after failed attempts)
✅ Password reset
✅ JWT tokens

### New AnyOffice Features
⭐ **Company-based registration** (register company + admin in one step)
⭐ **Role-based access control** (5 roles vs 4 in AnySchool)
⭐ **Department-level permissions**
⭐ **Subscription tier enforcement**

---

## 📊 ANALYTICS & REPORTING DIFFERENCES

### AnySchool Analytics
- Total students served
- Orders by school
- Donation impact
- Product popularity
- School engagement

### AnyOffice Analytics
- Spending trends ⭐
- Budget utilization ⭐
- Department comparison ⭐
- Cost savings analysis ⭐
- Procurement efficiency ⭐
- Supplier performance ⭐
- Employee ordering patterns ⭐
- ROI metrics ⭐

**Much more focus on financial analytics and cost optimization in AnyOffice**

---

## 💰 MONETIZATION DIFFERENCES

### AnySchool Revenue Model
1. Transaction fees (commission on orders)
2. School subscriptions (optional premium features)
3. Donor contributions

### AnyOffice Revenue Model
1. **Subscription tiers** (primary revenue):
   - Basic: R999/month
   - Professional: R2,999/month
   - Enterprise: Custom pricing
2. Optional transaction fees (1-2%)
3. Premium features (AI, advanced reporting)
4. Supplier listing fees ⭐

**More predictable SaaS revenue model**

---

## 🚀 FEATURE PARITY MATRIX

| Feature | AnySchool | AnyOffice | Notes |
|---------|-----------|-----------|-------|
| **User Authentication** | ✅ | ✅ | Similar |
| **Product Catalog** | ✅ | ✅ | AnyOffice has more categories |
| **Shopping Cart** | ✅ | ✅ | AnyOffice adds volume discounts |
| **Order Management** | ✅ | ✅ | AnyOffice adds approval workflows |
| **Payment Tracking** | ✅ | ✅ | Different payment models |
| **Supplier Management** | ✅ | ✅ | AnyOffice has deeper integration |
| **Messaging** | ✅ | ✅ | Similar |
| **Notifications** | ✅ | ✅ | Similar |
| **Analytics** | ✅ | ✅ | AnyOffice has more financial focus |
| **Multi-level Approvals** | ❌ | ✅ ⭐ | New |
| **Budget Management** | ❌ | ✅ ⭐ | New |
| **Inventory Tracking** | ⚠️ | ✅ ⭐ | Enhanced |
| **Department Management** | ❌ | ✅ ⭐ | New |
| **Subscription Tiers** | ⚠️ | ✅ ⭐ | Enhanced |
| **Purchase Orders** | ❌ | ✅ ⭐ | New |
| **Invoice Generation** | ❌ | ✅ ⭐ | New |
| **Cost Savings Analysis** | ❌ | ✅ ⭐ | New |
| **Sponsorship/Donations** | ✅ | ❌ | AnySchool only |
| **Events** | ✅ | ❌ | AnySchool only (lower priority) |

---

## 🗄️ DATABASE MIGRATION STRATEGY

If you want to use parts of AnySchool's database:

### Tables to Reuse (with modifications):
1. **users** - Add: companyId, departmentId, role enum values
2. **suppliers** - Add: paymentTerms, deliveryLeadTime, minimumOrderValue
3. **products** - Expand categories, add: volumeDiscounts, reorderLevel, minimumOrderQuantity
4. **orders** - Add: departmentId, approvedBy, priority, purchaseOrderNumber, invoiceNumber
5. **messages** - Reuse as-is
6. **notifications** - Reuse as-is

### Tables to Replace:
1. **schools** → **companies**
2. **children** → **departments** (different concept)

### New Tables to Create:
1. **departments**
2. **approval_workflows**
3. **budget_allocations**
4. **inventory_tracking**

---

## 🔧 API ENDPOINT MAPPING

### AnySchool → AnyOffice

| AnySchool Endpoint | AnyOffice Equivalent | Changes |
|--------------------|---------------------|---------|
| `GET /api/schools` | `GET /api/companies` | Rename |
| `GET /api/children` | `GET /api/employees` | Rename + expand |
| `POST /api/orders` | `POST /api/cart/checkout` | Different flow |
| `GET /api/orders/my-orders` | `GET /api/orders/my-orders` | Same |
| `GET /api/stationery` | `GET /api/products` | Rename |
| `GET /api/suppliers` | `GET /api/suppliers` | Same + enhanced |

### New AnyOffice Endpoints:
- `GET /api/departments`
- `POST /api/orders/{id}/approve`
- `GET /api/budgets/*`
- `GET /api/approvals/*`
- `GET /api/inventory/*`
- `GET /api/analytics/*` (enhanced)

---

## 📚 CODE REUSE CHECKLIST

### ✅ Components to Reuse

**Backend:**
- [ ] JwtTokenProvider.java
- [ ] JwtAuthenticationFilter.java
- [ ] SecurityConfig.java (with role updates)
- [ ] OTPService.java
- [ ] EmailService.java
- [ ] SupplierController.java (with enhancements)
- [ ] SupplierService.java
- [ ] Exception handlers
- [ ] Validation annotations

**Frontend:**
- [ ] AuthContext.js
- [ ] API configuration
- [ ] LandingPage.jsx (modify branding)
- [ ] LoginPage.jsx
- [ ] RegisterPage.jsx (modify for company registration)
- [ ] VerifyOtpPage.jsx
- [ ] Navbar.jsx (update links)
- [ ] Footer.jsx
- [ ] ProtectedRoute.jsx (update roles)
- [ ] LoadingSpinner.jsx
- [ ] ConfirmDialog.jsx
- [ ] StatusBadge.jsx (update status types)

### ❌ Components to Build from Scratch

**Backend:**
- [ ] Company model & controller
- [ ] Department model & controller
- [ ] ApprovalWorkflow service
- [ ] Budget service
- [ ] Inventory service
- [ ] Advanced analytics service

**Frontend:**
- [ ] All dashboards (different workflows)
- [ ] ApprovalQueuePage
- [ ] BudgetDashboard
- [ ] InventoryManagement
- [ ] Analytics pages (different metrics)

---

## 🎯 MIGRATION STRATEGY

If you're adapting AnySchool code:

### Phase 1: Copy & Rename
1. Copy AnySchool project
2. Rename packages: `com.anyschool` → `com.anyoffice`
3. Rename database: `anyschool_db` → `anyoffice_db`
4. Change ports: 8080 → 8081 (backend), 3000 → 3001 (frontend)

### Phase 2: Update Models
1. Rename School → Company
2. Remove Child model
3. Add Department model
4. Update User model (add departmentId, new roles)
5. Add new entities (ApprovalWorkflow, BudgetAllocation, InventoryTracking)

### Phase 3: Update Controllers
1. Update AuthController (company registration)
2. Rename SchoolController → CompanyController
3. Remove ChildController
4. Add DepartmentController
5. Update OrderController (approval workflow)
6. Add ApprovalController
7. Add BudgetController
8. Add InventoryController

### Phase 4: Update Frontend
1. Update branding (colors, logo, text)
2. Modify registration flow
3. Update dashboards (all new)
4. Add approval queue UI
5. Add budget management UI
6. Add inventory management UI

### Phase 5: Test & Deploy
1. Test all new workflows
2. Test multi-level approvals
3. Test budget tracking
4. Deploy to staging
5. Beta testing
6. Production launch

---

## 🚦 DECISION MATRIX

**When to reuse AnySchool code:**
- ✅ Authentication & security
- ✅ OTP & email services
- ✅ Basic CRUD operations
- ✅ Supplier management
- ✅ Messaging & notifications
- ✅ Common UI components

**When to build new:**
- 🆕 Approval workflows
- 🆕 Budget management
- 🆕 Department hierarchy
- 🆕 Inventory tracking
- 🆕 Advanced analytics
- 🆕 Role-based dashboards

---

## 📖 SUMMARY

**Similarities (70% code reuse potential):**
- Authentication system
- Product catalog structure
- Shopping cart
- Order management (base)
- Supplier management
- Messaging
- Notifications

**Key Differences (30% new development):**
- 🆕 Company/Department hierarchy (vs School/Child)
- 🆕 Multi-level approval workflows
- 🆕 Real-time budget tracking
- 🆕 Inventory management
- 🆕 B2B payment (invoices, POs)
- 🆕 Advanced financial analytics
- 🆕 Subscription tiers

**Development Time Saving:**
- Starting from scratch: 65 days
- Adapting from AnySchool: ~45 days ⏰
- **Time saved: 20 days (31%)**

---

**🎯 Bottom Line:** AnyOffice shares AnySchool's foundation but adds significant B2B complexity. You can reuse ~70% of the authentication, infrastructure, and basic CRUD code, but will need to build new features for approvals, budgets, and advanced analytics.

**💡 Recommendation:** Start fresh with the provided prompts to avoid technical debt from domain model misalignment. The time saved in refactoring will offset the time spent building from scratch.

---

**Good luck building AnyOffice! 🚀**
