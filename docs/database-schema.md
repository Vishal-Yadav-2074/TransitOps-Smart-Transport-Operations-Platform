# TransitOps Database Schema Specification

This document details the SQLite database schemas, relations, and table constraints managed via the Sequelize ORM.

## Entity Relationship Model

```mermaid
erDiagram
  VEHICLE ||--o{ TRIP : assigns
  VEHICLE ||--o{ MAINTENANCE : locks
  VEHICLE ||--o{ EXPENSE : debits
  DRIVER ||--o{ TRIP : drives
  USER ||--o{ TRIP : logs
  
  VEHICLE {
    INTEGER id PK
    STRING name
    STRING registration_no UK
    STRING vehicle_type
    DECIMAL max_capacity
    DECIMAL odometer
    DECIMAL acquisition_cost
    STRING state
  }

  DRIVER {
    INTEGER id PK
    STRING name
    STRING license_no UK
    STRING license_category
    DATE license_expiry
    STRING contact_no
    DECIMAL safety_score
    STRING state
  }

  TRIP {
    INTEGER id PK
    STRING name UK
    STRING source
    STRING dest
    DECIMAL cargo_weight
    DECIMAL planned_dist
    DECIMAL revenue
    STRING state
    INTEGER vehicle_id FK
    INTEGER driver_id FK
  }

  MAINTENANCE {
    INTEGER id PK
    STRING name
    DECIMAL cost
    DATE date
    STRING state
    INTEGER vehicle_id FK
  }

  EXPENSE {
    INTEGER id PK
    STRING name
    STRING expense_type
    DECIMAL amount
    DATE date
    INTEGER vehicle_id FK
  }
```

## Schema Details

### 1. `vehicles`
- `registration_no`: Unique constraint. Restricts duplicate vehicle license logs.
- `state`: Enum values (`available`, `on_trip`, `in_shop`, `retired`). Default is `available`.

### 2. `drivers`
- `license_no`: Unique constraint. Restricts duplicate commercial licenses.
- `state`: Enum values (`available`, `on_trip`, `off_duty`, `suspended`). Default is `available`.

### 3. `trips`
- `vehicle_id` / `driver_id`: Foreign keys mapping back to assets tables. Cascade deletes are blocked to preserve commercial dispatch histories.
- `state`: Enum values (`draft`, `dispatched`, `completed`, `cancelled`). Default is `draft`.

### 4. `maintenances`
- Logs vehicle repair records. If state is `open`, the associated vehicle's state is locked as `in_shop` to block dispatch routes.

### 5. `expenses`
- Debits operational expenses (Fuel refill, Toll tickets, and other parts billing) to calculate vehicle ROI profitability index.
