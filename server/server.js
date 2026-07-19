const app = require('./app');
const { sequelize, User } = require('./models');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Load environment configuration
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Auto-create database if not exists
    const isSQLite = process.env.DB_DIALECT === 'sqlite';
    if (!isSQLite) {
      const dbName = process.env.DB_NAME || 'transitops_db';
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS === undefined ? '' : process.env.DB_PASS,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.end();
      console.log(`[MySQL Logger]: Database "${dbName}" checked/created.`);
    } else {
      console.log('[SQLite Logger]: Running in SQLite mode.');
    }

    // 2. Verify connection
    await sequelize.authenticate();
    console.log('[MySQL Logger]: Connection established with database server.');

    // 3. Synchronize structures
    await sequelize.sync();
    console.log('[MySQL Logger]: Models synchronized with tables.');

    // 4. Seed default user roles and Indian transport demo data
    const userCount = await User.count();
    if (userCount === 0) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
      const hashedPassword = await bcrypt.hash('password123', saltRounds);
      await User.bulkCreate([
        { username: 'manager', password: hashedPassword, email: 'manager@transitops.com', role: 'Fleet Manager' },
        { username: 'driver1', password: hashedPassword, email: 'driver1@transitops.com', role: 'Driver' },
        { username: 'safety', password: hashedPassword, email: 'safety@transitops.com', role: 'Safety Officer' },
        { username: 'analyst', password: hashedPassword, email: 'analyst@transitops.com', role: 'Financial Analyst' },
      ]);
      console.log('[MySQL Logger]: Default user roles seeded successfully.');
    }

    const { seedIndianTransportData } = require('./database/seed');
    await seedIndianTransportData();

    // 5. Bind port and start listening
    app.listen(PORT, () => {
      console.log(`[Express Logger]: TransitOps Core API listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  } catch (error) {
    console.error('[Fatal Sync Failure]: Unable to start TransitOps server:', error);
    process.exit(1);
  }
}

startServer();
