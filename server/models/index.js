const sequelize = require('../config/db');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Trip = require('./Trip');
const Maintenance = require('./Maintenance');
const Expense = require('./Expense');

// Establish Database Associations / Relations

// Vehicle <-> Maintenance
Vehicle.hasMany(Maintenance, { foreignKey: 'vehicleId', as: 'Maintenances', onDelete: 'CASCADE' });
Maintenance.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'Vehicle' });

// Vehicle <-> Expense
Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'Expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'Vehicle' });

// Vehicle <-> Trip
Vehicle.hasMany(Trip, { foreignKey: 'vehicleId', as: 'Trips', onDelete: 'RESTRICT' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'Vehicle' });

// Driver <-> Trip
Driver.hasMany(Trip, { foreignKey: 'driverId', as: 'Trips', onDelete: 'RESTRICT' });
Trip.belongsTo(Driver, { foreignKey: 'driverId', as: 'Driver' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  Expense
};
