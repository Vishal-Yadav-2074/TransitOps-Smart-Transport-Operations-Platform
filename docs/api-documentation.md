# TransitOps API Route Specification

This document lists the available HTTP REST API routes exposed by the Express backend service.

## API Endpoint Categories

### 1. Authentication (`/api/auth`)
- **POST `/login`**: Authenticate client.
  - Body: `{ username, password }`
  - Returns: `{ success: true, token, user: { id, username, role } }`
- **GET `/me`**: Verify active JWT token payload.

### 2. Vehicles (`/api/vehicles`)
- **GET `/`**: Retrieve vehicle inventory list.
- **GET `/:id`**: Fetch specific vehicle profile.
- **POST `/`**: Add new vehicle.
  - Body: `{ name, registrationNo, vehicleType, maxCapacity, odometer, acquisitionCost, state }`
- **PUT `/:id`**: Update vehicle details.
- **DELETE `/:id`**: Archive vehicle asset.

### 3. Drivers (`/api/drivers`)
- **GET `/`**: Retrieve driver roster details.
- **GET `/:id`**: Fetch specific driver profile.
- **POST `/`**: Add driver profile.
  - Body: `{ name, licenseNo, licenseCategory, licenseExpiry, contactNo, safetyScore, state }`
- **PUT `/:id`**: Update driver profile.
- **DELETE `/:id`**: Delete driver.

### 4. Trips Dispatcher (`/api/trips`)
- **GET `/`**: Retrieve dispatch logs list.
- **GET `/:id`**: Fetch specific trip record.
- **POST `/`**: Book trip record (Initial state: `draft`).
  - Body: `{ source, dest, vehicleId, driverId, cargoWeight, plannedDist, revenue }`
- **PUT `/:id`**: Edit draft trip.
- **POST `/:id/dispatch`**: Dispatch trip (Locks vehicle & driver as `on_trip`).
- **POST `/:id/complete`**: Complete trip (Releases vehicle & driver as `available`).
- **POST `/:id/cancel`**: Cancel trip (Releases vehicle & driver if dispatched).

### 5. Maintenance Lockouts (`/api/vehicles/maintenance`)
- **GET `/`**: Fetch all maintenance jobs.
- **POST `/`**: Log maintenance repair.
  - Body: `{ name, vehicleId, cost, date, state }`
  - Note: `name` contains serialized bracket metadata. If state is `open`, locks vehicle as `in_shop`.
- **PUT `/:id`**: Edit maintenance job status (e.g. mark closed).
- **DELETE `/:id`**: Delete maintenance job record.

### 6. Expense Ledger (`/api/vehicles/expenses`)
- **GET `/`**: Fetch all operational expenses.
- **POST `/`**: Log expense transaction.
  - Body: `{ name, vehicleId, expenseType, amount, date }`

### 7. Analytical Reports (`/api/reports`)
- **GET `/stats`**: Get aggregated command dashboard numbers and telemetry trends.
- **POST `/trigger-reminders`**: Dispatch operational email summaries to operators.
