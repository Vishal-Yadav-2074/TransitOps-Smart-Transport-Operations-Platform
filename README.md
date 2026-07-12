# TransitOps - Centralized Transport and Fleet Operations Platform

TransitOps is a centralized fleet operations web dashboard. It manages vehicles, driver files, trip dispatching, maintenance logs, and fuel/expense tracking with strict safety constraints and real-time Return on Investment (ROI) analytics.

## 🚀 Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + Sequelize ORM
- **Database**: MySQL
- **Charts**: Recharts
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs

---

## 🛠️ Installation & Setup

### 1. Database Setup
1. Open your MySQL client (e.g. MySQL Command Line Client or WorkBench).
2. Import the schema and seed data located at `database/schema.sql`:
   ```sql
   SOURCE database/schema.sql;
   ```
   *This creates a database named `transitops_db` and seeds users for test log-ins.*

### 2. Configure Environment `.env`
Create a `.env` file in the project root directory (pre-configured variables are already set up).
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password_here
DB_NAME=transitops_db
JWT_SECRET=transitops_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Start Backend Server
1. Navigate to the `server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The server starts listening on `http://localhost:5000` and synchronizes ORM tables.*

### 4. Start Frontend Client
1. Navigate to the `client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development client:
   ```bash
   npm run dev
   ```
   *The client opens at `http://localhost:5173` with full API proxying.*

---

## 🔑 Hackathon Demo Logins

All test user passwords are: **`password123`**

| Role | Username | Permissions |
| :--- | :--- | :--- |
| **Fleet Manager** | `manager` | Full access to add/edit/delete all records and dispatch/complete trips. |
| **Safety Officer** | `safety` | Create/edit drivers and maintenance logs. Create/dispatch/cancel trips. |
| **Financial Analyst** | `analyst` | Create/edit vehicles, log fuel/tolls expenses, and audit financial reports. |
| **Driver** | `driver1` | Read access to assigned resources and ability to mark assigned trips as Completed. |
