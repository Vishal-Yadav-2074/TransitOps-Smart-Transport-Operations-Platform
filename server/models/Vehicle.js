const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  registrationNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'registration_no'
  },
  vehicleType: {
    type: DataTypes.ENUM('van', 'truck', 'trailer', 'bike'),
    allowNull: false,
    defaultValue: 'van',
    field: 'vehicle_type'
  },
  maxCapacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'max_capacity'
  },
  odometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  acquisitionCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    field: 'acquisition_cost'
  },
  state: {
    type: DataTypes.ENUM('available', 'on_trip', 'in_shop', 'retired'),
    allowNull: false,
    defaultValue: 'available'
  },
  // Computed (virtual) fields summing up associations
  operationalCost: {
    type: DataTypes.VIRTUAL,
    get() {
      const maintenances = this.Maintenances || [];
      const expenses = this.Expenses || [];
      const maintTotal = maintenances.reduce((acc, m) => acc + parseFloat(m.cost || 0), 0);
      const expTotal = expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
      return maintTotal + expTotal;
    }
  },
  revenue: {
    type: DataTypes.VIRTUAL,
    get() {
      const trips = this.Trips || [];
      const completedTrips = trips.filter(t => t.state === 'completed');
      return completedTrips.reduce((acc, t) => acc + parseFloat(t.revenue || 0), 0);
    }
  },
  vehicleRoi: {
    type: DataTypes.VIRTUAL,
    get() {
      const acqCost = parseFloat(this.acquisitionCost || 0);
      if (acqCost <= 0) return 0;
      return (this.revenue - this.operationalCost) / acqCost;
    }
  }
}, {
  tableName: 'vehicles'
});

module.exports = Vehicle;
