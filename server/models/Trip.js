const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  source: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dest: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  vehicleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'vehicle_id'
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'driver_id'
  },
  cargoWeight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'cargo_weight'
  },
  plannedDist: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'planned_dist'
  },
  revenue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  state: {
    type: DataTypes.ENUM('draft', 'dispatched', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  }
}, {
  tableName: 'trips'
});

module.exports = Trip;
