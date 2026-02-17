# The Stationery Hub - Shared Database Architecture 🏗️

**Multi-Platform Database Design for AnySchool & AnyOffice**

---

## 🎯 Overview

The Stationery Hub uses a **shared database architecture** to enable both AnySchool (B2C Education) and AnyOffice (B2B Business) platforms to:

✅ Share the same product catalog (stationery items)  
✅ Share supplier information  
✅ Reduce data duplication  
✅ Simplify catalog management  
✅ Enable future cross-platform analytics  
✅ Maintain platform independence  

**Database Name:** `stationeryhub_db`

---

## 🏛️ Architecture Design

```
┌──────────────────────────────────────────────────────────────────┐
│                     stationeryhub_db                             │
│                  (PostgreSQL Database)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐      ┌──────────────────────────────┐ │
│  │   SHARED TABLES     │      │  PLATFORM-SPECIFIC TABLES    │ │
│  │  (Both Platforms)   │      │                              │ │
│  ├─────────────────────┤      ├──────────────────────────────┤ │
│  │                     │      │  AnySchool (No Prefix)       │ │
│  │ • stationery        │◄─────┤  • users                     │ │
│  │ • suppliers         │      │  • schools                   │ │
│  │ • stationery_       │      │  • children                  │ │
│  │   bundles           │      │  • orders                    │ │
│  │                     │      │  • order_items               │ │
│  │                     │      │  • communications            │ │
│  │                     │      │  • school_events             │ │
│  │                     │      │                              │ │
│  │                     │      │  AnyOffice (office_ prefix)  │ │
│  │                     │◄─────┤  • office_users              │ │
│  │                     │      │  • office_companies          │ │
│  │                     │      │  • office_departments        │ │
│  │                     │      │  • office_orders             │ │
│  │                     │      │  • office_order_items        │ │
│  │                     │      │  • office_approvals          │ │
│  │                     │      │  • office_budget             │ │
│  │                     │      │  • office_inventory          │ │
│  └─────────────────────┘      └──────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Table Classification

### 1. SHARED TABLES (No Platform Prefix)

These tables are used by **both** AnySchool and AnyOffice:

| Table | Purpose | Shared By |
|-------|---------|-----------|
| **`stationery`** | Product catalog (pens, paper, supplies, etc.) | Both |
| **`suppliers`** | Supplier information and contacts | Both |
| **`stationery_bundles`** | Pre-packaged product bundles | Both (future) |

**Foreign Key Pattern:**
- AnySchool order_items → `stationery.id`
- AnyOffice office_order_items → `stationery.id`

---

### 2. ANYSCHOOL TABLES (No Prefix)

Platform-specific tables for the education vertical:

| Table | Purpose |
|-------|---------|
| **`users`** | Parents, school admins, donors |
| **`schools`** | School profiles |
| **`children`** | Student profiles |
| **`orders`** | School supply orders |
| **`order_items`** | Order line items (links to `stationery`) |
| **`communications`** | Parent-school messages |
| **`school_events`** | School calendar events |
| **`school_requests`** | School onboarding requests |

---

### 3. ANYOFFICE TABLES (office_ Prefix)

Platform-specific tables for the business vertical:

| Table | Purpose |
|-------|---------|
| **`office_users`** | Employees, managers, admins |
| **`office_companies`** | Company profiles |
| **`office_departments`** | Department structure |
| **`office_orders`** | Office supply orders |
| **`office_order_items`** | Order line items (links to `stationery`) |
| **`office_approval_workflows`** | Multi-level order approvals |
| **`office_budget_allocations`** | Department budget tracking |
| **`office_approval_rules`** | Automated approval routing |
| **`office_budget_transactions`** | Budget audit trail |
| **`office_inventory_tracking`** | Stock management |
| **`office_communications`** | Internal company messages |
| **`office_notifications`** | System notifications |
| **`office_saved_carts`** | Draft orders |
| **`office_activity_logs`** | Audit trail |
| **`office_analytics_snapshots`** | Pre-computed reports |

---

## 🔗 Foreign Key Relationships

### Shared Catalog Foreign Keys

**AnySchool → Stationery:**
```sql
-- order_items table
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_stationery
  FOREIGN KEY (stationery_id) REFERENCES stationery(id);
```

**AnyOffice → Stationery:**
```sql
-- office_order_items table
ALTER TABLE office_order_items
  ADD CONSTRAINT fk_office_order_items_stationery
  FOREIGN KEY (stationery_id) REFERENCES stationery(id);
```

Both platforms reference the **same** stationery records.

---

## 🔢 Migration Versioning Strategy

To avoid conflicts, migrations are versioned by platform:

| Platform | Migration Versions | Example |
|----------|-------------------|---------|
| **AnySchool** | V1__ to V9__ | `V1__create_users_table.sql` |
| **AnyOffice** | V10__ onwards | `V10__create_office_core_tables.sql` |
| **Shared** | V1__ to V9__ | Already created by AnySchool |

**Flyway Configuration:**

**AnySchool (application.properties):**
```properties
spring.flyway.baseline-version=0
spring.flyway.locations=classpath:db/migration
```

**AnyOffice (application.properties):**
```properties
spring.flyway.baseline-version=9
spring.flyway.locations=classpath:db/migration
# Migrations start at V10__
```

---

## 🚪 Port Allocation

To run both platforms simultaneously:

| Platform | Backend Port | Frontend Port |
|----------|-------------|---------------|
| AnySchool | 8080 | 3000 |
| AnyOffice | 8081 | 3001 |

---

## 🔐 Security & Isolation

### User Isolation

Users are **completely separate** between platforms:

- **AnySchool:** `users` table
- **AnyOffice:** `office_users` table

**No shared authentication** - A user in AnySchool cannot log into AnyOffice and vice versa.

### Data Isolation

Platform-specific data is isolated by:

1. **Separate Tables:** Different table names
2. **Foreign Keys:** Platform-specific foreign key constraints
3. **Application Logic:** Each backend only accesses its own tables

Example:
```java
// AnySchool backend - accesses users table
@Entity
@Table(name = "users")
public class User { ... }

// AnyOffice backend - accesses office_users table
@Entity
@Table(name = "office_users")
public class OfficeUser { ... }
```

---

## 📈 Benefits of Shared Database

### ✅ Advantages

1. **Single Product Catalog**
   - Update prices once, reflect everywhere
   - Consistent product information
   - Easier stock management

2. **Unified Supplier Management**
   - Single supplier database
   - Centralized supplier performance tracking
   - Simplified procurement

3. **Cross-Platform Analytics** (Future)
   - Total platform revenue
   - Unified sales reporting
   - Supplier performance across both platforms

4. **Reduced Infrastructure Costs**
   - One database instance
   - Simplified backups
   - Lower maintenance overhead

### ⚠️ Considerations

1. **Schema Coordination**
   - Must coordinate migration versions
   - Changes to shared tables affect both platforms

2. **Performance Monitoring**
   - Monitor query performance from both platforms
   - Ensure indexes support both use cases

3. **Backup Strategy**
   - Single backup contains both platforms
   - Platform-specific restore requires selective recovery

---

## 🔄 Deployment Strategy

### Database Setup

1. **Create Database (Once)**
   ```bash
   psql -U postgres
   CREATE DATABASE stationeryhub_db;
   ```

2. **Deploy AnySchool First**
   ```bash
   cd AnySchool/anyschool-backend
   mvn flyway:migrate  # Runs V1-V9 migrations
   ```

3. **Deploy AnyOffice Second**
   ```bash
   cd AnyOffice/anyoffice-backend
   mvn flyway:migrate  # Runs V10+ migrations
   ```

### Running Both Platforms

```bash
# Terminal 1 - AnySchool Backend
cd AnySchool/anyschool-backend
mvn spring-boot:run  # Port 8080

# Terminal 2 - AnyOffice Backend
cd AnyOffice/anyoffice-backend
mvn spring-boot:run  # Port 8081

# Terminal 3 - AnySchool Frontend
cd AnySchool/anyschool-frontend
npm start  # Port 3000

# Terminal 4 - AnyOffice Frontend
cd AnyOffice/anyoffice-frontend
npm start  # Port 3001
```

---

## 🧪 Testing Strategy

### Shared Data Testing

Test that both platforms can:
- ✅ Read from shared `stationery` table
- ✅ Create orders referencing shared products
- ✅ Not interfere with each other's orders

### Isolation Testing

Verify that:
- ❌ AnySchool cannot access `office_orders`
- ❌ AnyOffice cannot access `orders`
- ❌ Cross-platform user authentication fails

---

## 📚 Query Examples

### AnySchool: Get Product for Order

```sql
-- AnySchool creates order
INSERT INTO orders (user_id, school_id, total_amount, ...)
VALUES (1, 5, 150.00, ...);

-- Add order items (using shared stationery)
INSERT INTO order_items (order_id, stationery_id, quantity, unit_price)
VALUES (101, 25, 10, 5.00);  -- stationery_id 25 from shared table
```

### AnyOffice: Get Same Product for Order

```sql
-- AnyOffice creates order
INSERT INTO office_orders (user_id, company_id, department_id, total_amount, ...)
VALUES (50, 10, 3, 500.00, ...);

-- Add order items (using SAME shared stationery)
INSERT INTO office_order_items (order_id, stationery_id, quantity, unit_price)
VALUES (201, 25, 100, 4.50);  -- SAME stationery_id 25, bulk discount
```

Both platforms reference **stationery.id = 25**.

### Analytics: Total Sales Across Platforms

```sql
-- Future: Cross-platform analytics
SELECT 
  'AnySchool' as platform,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue
FROM orders
WHERE status = 'DELIVERED'

UNION ALL

SELECT 
  'AnyOffice' as platform,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue
FROM office_orders
WHERE status = 'COMPLETED';
```

---

## 🔮 Future Enhancements

### Phase 1: Current (Separate but Shared Catalog)
- ✅ Separate user bases
- ✅ Shared product catalog
- ✅ Independent operations

### Phase 2: Unified Admin Panel (Future)
- Single super-admin dashboard
- Cross-platform analytics
- Unified supplier management

### Phase 3: Single Sign-On (Future)
- Allow users to have accounts on both platforms
- Link accounts with shared authentication
- Cross-platform user profiles

### Phase 4: Complete Integration (Future)
- Companies can order school supplies for CSR programs
- Schools can leverage B2B pricing
- Unified loyalty/rewards program

---

## 📝 Database Naming Conventions

| Type | AnySchool | AnyOffice |
|------|-----------|-----------|
| **Tables** | No prefix | `office_` prefix |
| **Indexes** | `idx_{table}_{column}` | `idx_office_{table}_{column}` |
| **Foreign Keys** | `fk_{table}_{ref}` | `fk_office_{table}_{ref}` |
| **Functions** | `{action}_{table}` | `{action}_office_{table}` |
| **Triggers** | `trigger_{table}_{action}` | `trigger_office_{table}_{action}` |

---

## 🎓 Summary

**Shared Database Design = Best of Both Worlds**

✅ **Efficiency:** Single product catalog, no duplication  
✅ **Independence:** Platforms operate separately  
✅ **Scalability:** Easy to add new platforms (AnyHome, AnyGov, etc.)  
✅ **Maintainability:** Clear naming conventions prevent conflicts  
✅ **Future-Ready:** Foundation for cross-platform features  

**Key Principle:** "Share what's common (products), separate what's unique (users, orders, business logic)"

---

**Built with 🏢🎒 by The Stationery Hub Team**
