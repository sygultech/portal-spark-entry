# Fee Management System - Data Logic Documentation

## 📊 Overview

The fee management system uses a **two-level architecture** to handle fee assignments and individual fee tracking. This document explains the relationship between the `fee_assignments` and `student_fees` tables and their respective purposes.

## 🏗️ Architecture

```
Admin Assignment Action
         ↓
┌─────────────────────┐    ┌─────────────────────┐
│   fee_assignments   │    │    student_fees     │
│   (Operation Level) │    │   (Student Level)   │
├─────────────────────┤    ├─────────────────────┤
│ • One record per    │    │ • One record per    │
│   assignment op     │    │   student per fee   │
│ • Tracks metadata   │    │ • Tracks payments   │
│ • Audit trail       │    │ • Individual status │
│ • Bulk info         │    │ • Payment history   │
└─────────────────────┘    └─────────────────────┘
```

## 📋 Table 1: `fee_assignments` - Assignment Operations (Metadata)

### Purpose
Track the **bulk assignment operation** itself for audit and administrative purposes.

### Storage Pattern
**One record per assignment operation**

### Table Structure
```sql
fee_assignments {
  id                 UUID PRIMARY KEY
  fee_structure_id   UUID REFERENCES fee_structures(id)
  assignment_type    TEXT ('batch' | 'individual')
  assigned_by        UUID REFERENCES profiles(id)
  batch_ids          UUID[]              -- Array of batch IDs
  student_ids        UUID[]              -- Array of affected student IDs
  assignment_date    DATE
  students_count     INTEGER             -- Total students affected
  total_amount       NUMERIC             -- Total amount assigned
  notes              TEXT
  school_id          UUID
  academic_year_id   UUID
  created_at         TIMESTAMP
  updated_at         TIMESTAMP
}
```

### Example Record
```json
{
  "id": "assignment-uuid-123",
  "assignment_type": "batch",
  "batch_ids": ["batch-uuid-1"],
  "student_ids": ["student1", "student2", "student3"],
  "students_count": 3,
  "total_amount": 300,
  "assignment_date": "2025-06-26",
  "notes": "Assignment created from wizard - batch assignment"
}
```

### What it tracks:
- ✅ **Who** made the assignment (`assigned_by`)
- ✅ **When** it was made (`assignment_date`)
- ✅ **What type** (batch vs individual assignment)
- ✅ **Which batches/students** were targeted
- ✅ **How many students** were affected
- ✅ **Total operation scope** and amount
- ✅ **Audit trail** for administrative purposes

## 💰 Table 2: `student_fees` - Individual Fee Records (Operational)

### Purpose
Manage **individual student fee tracking**, payments, and status for each student.

### Storage Pattern
**One record per student per fee structure**

### Table Structure
```sql
student_fees {
  id                 UUID PRIMARY KEY
  student_id         UUID REFERENCES student_details(id)
  fee_structure_id   UUID REFERENCES fee_structures(id)
  academic_year_id   UUID REFERENCES academic_years(id)
  batch_id           UUID REFERENCES batches(id)
  school_id          UUID REFERENCES schools(id)
  total_amount       NUMERIC             -- Amount for this student
  paid_amount        NUMERIC DEFAULT 0   -- Amount paid so far
  balance            NUMERIC             -- Remaining balance
  status             TEXT                -- 'pending', 'partial', 'paid', 'overdue', 'waived'
  assignment_date    DATE
  due_date           DATE
  notes              TEXT
  created_at         TIMESTAMP
  updated_at         TIMESTAMP
}
```

### Example Records
```json
[
  {
    "id": "fee-uuid-1",
    "student_id": "student1",
    "fee_structure_id": "fee-struct-1",
    "total_amount": 100,
    "paid_amount": 0,
    "balance": 100,
    "status": "pending"
  },
  {
    "id": "fee-uuid-2", 
    "student_id": "student2",
    "fee_structure_id": "fee-struct-1",
    "total_amount": 100,
    "paid_amount": 50,
    "balance": 50,
    "status": "partial"
  },
  {
    "id": "fee-uuid-3",
    "student_id": "student3", 
    "fee_structure_id": "fee-struct-1",
    "total_amount": 100,
    "paid_amount": 100,
    "balance": 0,
    "status": "paid"
  }
]
```

### What it tracks:
- ✅ **Individual payment status** per student
- ✅ **Partial payments** and balance tracking
- ✅ **Due dates** specific to each student
- ✅ **Payment history** linkage (via fee_payments table)
- ✅ **Fee collection** operations
- ✅ **Individual fee modifications** (waivers, adjustments)

## 🔄 Data Flow Process

### When you assign fees to a batch:

#### Step 1: Create Assignment Record
```sql
INSERT INTO fee_assignments (
  fee_structure_id,
  assignment_type,
  batch_ids,
  student_ids,
  students_count,
  total_amount,
  notes
) VALUES (
  'fee-structure-uuid',
  'batch',
  ['batch-a-uuid'],
  ['student1', 'student2', 'student3', 'student4', 'student5'],
  5,
  500,
  'Assignment created from wizard - batch assignment'
);
```

#### Step 2: Create Individual Student Records
```sql
INSERT INTO student_fees (student_id, fee_structure_id, total_amount, status)
VALUES 
  ('student1', 'fee-structure-uuid', 100, 'pending'),
  ('student2', 'fee-structure-uuid', 100, 'pending'),
  ('student3', 'fee-structure-uuid', 100, 'pending'),
  ('student4', 'fee-structure-uuid', 100, 'pending'),
  ('student5', 'fee-structure-uuid', 100, 'pending');
```

## 📊 Comparison Table

| Aspect | fee_assignments | student_fees |
|--------|----------------|--------------|
| **Granularity** | Operation-level | Student-level |
| **Purpose** | Audit & History | Payment Management |
| **Cardinality** | 1 per assignment | N per assignment |
| **Updates** | Rarely changed | Frequently updated |
| **Primary Queries** | "What assignments were made?" | "What does this student owe?" |
| **Data Type** | Arrays for bulk data | Individual records |
| **Payment Tracking** | Total amounts only | Detailed payment status |
| **Historical Value** | Assignment operations | Payment transactions |

## 🎯 Real-World Example

### Scenario: "Assign Annual Fees to Class 1 Batch A"

#### fee_assignments table (1 record):
```json
{
  "id": "assignment-123",
  "assignment_type": "batch",
  "batch_ids": ["class-1-batch-a"],
  "student_ids": ["john-doe", "jane-smith", "bob-wilson", "alice-brown", "charlie-davis"],
  "students_count": 5,
  "total_amount": 500,
  "assignment_date": "2025-06-26",
  "notes": "Annual fees for Class 1 Batch A"
}
```

#### student_fees table (5 records):
```json
[
  {"student_id": "john-doe", "total_amount": 100, "paid_amount": 100, "status": "paid"},
  {"student_id": "jane-smith", "total_amount": 100, "paid_amount": 50, "status": "partial"},
  {"student_id": "bob-wilson", "total_amount": 100, "paid_amount": 0, "status": "pending"},
  {"student_id": "alice-brown", "total_amount": 100, "paid_amount": 100, "status": "paid"},
  {"student_id": "charlie-davis", "total_amount": 100, "paid_amount": 0, "status": "waived"}
]
```

### Business Outcomes:
- **Administrative View**: "We assigned annual fees to 5 students in Class 1 Batch A"
- **Financial View**: "₹200 collected, ₹100 pending, ₹100 waived, ₹100 partial"
- **Student View**: Each student sees their individual fee status and payment history

## 🚀 Benefits of This Design

### 1. **Separation of Concerns**
- Assignment operations tracked separately from individual payments
- Clear audit trail for administrative actions
- Detailed payment management for operational needs

### 2. **Scalability**
- Efficient bulk operations (one assignment record for many students)
- Individual tracking doesn't affect assignment history
- Easy to query both levels independently

### 3. **Flexibility**
- Individual student fees can be modified without affecting assignment record
- Support for partial payments, waivers, and adjustments
- Multiple assignment operations can target the same students

### 4. **Audit & Compliance**
- Complete history of who assigned what and when
- Individual payment trail for each student
- Easy reporting at both operational and administrative levels

## 🔍 Key Relationships

```sql
-- Get all students affected by a specific assignment
SELECT sf.* 
FROM student_fees sf
JOIN fee_assignments fa ON sf.fee_structure_id = fa.fee_structure_id
WHERE fa.id = 'assignment-uuid'
  AND sf.student_id = ANY(fa.student_ids);

-- Get assignment history for a specific fee structure
SELECT fa.*, array_length(fa.student_ids, 1) as affected_students
FROM fee_assignments fa
WHERE fa.fee_structure_id = 'fee-structure-uuid'
ORDER BY fa.created_at DESC;

-- Get individual payment status for students in an assignment
SELECT 
  fa.assignment_date,
  fa.assignment_type,
  sf.student_id,
  sf.total_amount,
  sf.paid_amount,
  sf.status
FROM fee_assignments fa
JOIN student_fees sf ON sf.fee_structure_id = fa.fee_structure_id
WHERE fa.id = 'assignment-uuid'
  AND sf.student_id = ANY(fa.student_ids);
```

## 📝 Notes

- **student_ids arrays** in fee_assignments are for tracking and audit purposes
- **Individual student_fees records** are for operational payment management
- Both tables reference the same `fee_structure_id` to maintain consistency
- The design supports both batch and individual assignment workflows
- Late joiners can be easily handled by creating new student_fees records without modifying existing assignment records

---

*This document serves as the definitive guide for understanding the fee management data architecture. Refer to this when implementing new features or debugging fee-related issues.* 