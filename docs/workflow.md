# TransitOps Dispatch & Maintenance Workflow Specification

This document outlines the operational gate validation checks, asset state machines, and lifecycles implemented in the platform.

## 1. The Dispatch Workflow Roster Gate

Before a trip can be booked or transitioned into the active dispatch route, the platform runs strict business rule validation checks:

```
[Book Trip Request] 
       │
       ├─► [Check Cargo Payload] ────► Is Cargo > Vehicle Capacity? ──► YES ──► [Block & Toast Error]
       │                                                                  
       ├─► [Check Vehicle State] ────► Is Vehicle In Shop/Retired? ───► YES ──► [Block & Toast Error]
       │                                                                  
       └─► [Check Driver State] ─────► Is License Expired/Suspended? ──► YES ──► [Block & Toast Error]
                                                                          
```

### State Machine Lifecycle of a Trip:
1. **Draft state**: Initial booking log. Assigned assets remain `available`.
2. **Dispatch transition**: Dispatches assets. Vehicle becomes `on_trip` and Driver becomes `on_trip` in sqlite.
3. **Complete transition**: Trip delivered. Assets returned to `available`.
4. **Cancel transition**: Dispatch cancelled. Releases assets back to `available`.

---

## 2. The Maintenance Lockout Lifecycle

Maintenance is designed as a physical blockade to ensure safety compliance:

```
[Open Maintenance Job]
       │
       └─► Vehicle State locks as "in_shop" 
                 │
                 └─► Hidden from Active Dispatch Dropdowns
                           │
                           └─► [Close Maintenance Job]
                                     │
                                     └─► Vehicle State returns to "available"
```

---

## 3. Expense Ledger Calculation
- When any **Expense** (Fuel Refill, Toll Ticket) or **Maintenance job** billing is written:
  - The SQLite database recalculates the associated vehicle's `operationalCost` field.
  - The vehicle profitability ROI yield metric updates automatically:
    $$\text{Vehicle ROI} = \frac{\text{Trip Revenue} - \text{Operational Cost}}{\text{Acquisition Cost}}$$
  - The Reports dashboard metrics refresh automatically.
