const { Vehicle, Maintenance, Expense, Trip } = require('../models');

exports.getAllVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({
      include: [
        { model: Maintenance, as: 'Maintenances' },
        { model: Expense, as: 'Expenses' },
        { model: Trip, as: 'Trips' }
      ]
    });

    const serialized = vehicles.map(v => v.toJSON());
    res.status(200).json({ success: true, data: serialized });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [
        { model: Maintenance, as: 'Maintenances' },
        { model: Expense, as: 'Expenses' },
        { model: Trip, as: 'Trips' }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    res.status(200).json({ success: true, data: vehicle.toJSON() });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const { name, registrationNo, vehicleType, maxCapacity, odometer, acquisitionCost, state } = req.body;
    
    // Check registration number uniqueness
    const existing = await Vehicle.findOne({ where: { registrationNo } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Registration number already exists.' });
    }

    const vehicle = await Vehicle.create({
      name,
      registrationNo,
      vehicleType,
      maxCapacity,
      odometer,
      acquisitionCost,
      state
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const { name, registrationNo, vehicleType, maxCapacity, odometer, acquisitionCost, state } = req.body;

    if (registrationNo && registrationNo !== vehicle.registrationNo) {
      const existing = await Vehicle.findOne({ where: { registrationNo } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Registration number already exists.' });
      }
    }

    await vehicle.update({
      name,
      registrationNo,
      vehicleType,
      maxCapacity,
      odometer,
      acquisitionCost,
      state
    });

    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Check if the vehicle is currently on a trip or has active trips
    const activeTrips = await Trip.findOne({ 
      where: { vehicleId: vehicle.id, state: ['draft', 'dispatched'] } 
    });
    if (activeTrips) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete vehicle. It is currently associated with an active/dispatched trip.' 
      });
    }

    await vehicle.destroy();
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
