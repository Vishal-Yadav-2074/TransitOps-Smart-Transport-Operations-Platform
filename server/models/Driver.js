const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  licenseNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'license_no'
  },
  licenseCategory: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'license_category'
  },
  licenseExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'license_expiry'
  },
  contactNo: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contact_no'
  },
  safetyScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100.00,
    field: 'safety_score'
  },
  state: {
    type: DataTypes.ENUM('available', 'on_trip', 'off_duty', 'suspended'),
    allowNull: false,
    defaultValue: 'available'
  }
}, {
  tableName: 'drivers'
});

// Instance method to check compliance (Year-Month based)
Driver.prototype.checkCompliance = function () {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMonth = todayStr.substring(0, 7); // YYYY-MM
  const expiryMonth = this.licenseExpiry ? this.licenseExpiry.substring(0, 7) : '';
  
  if (expiryMonth && expiryMonth < todayMonth) {
    return false;
  }
  if (this.state === 'suspended' || this.state === 'off_duty') {
    return false;
  }
  return true;
};

module.exports = Driver;
