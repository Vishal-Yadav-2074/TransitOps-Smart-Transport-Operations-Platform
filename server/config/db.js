const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables from the project root .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const isSQLite = process.env.DB_DIALECT === 'sqlite';

const sequelize = isSQLite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database/transitops.sqlite'),
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'transitops_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASS === undefined ? '' : process.env.DB_PASS,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: true // Map camelCase in JS to snake_case in DB
        }
      }
    );

module.exports = sequelize;
