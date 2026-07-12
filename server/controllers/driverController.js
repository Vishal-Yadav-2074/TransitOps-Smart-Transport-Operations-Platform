const { Driver, Trip } = require('../models');

exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.findAll();
    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const { name, licenseNo, licenseCategory, licenseExpiry, contactNo, safetyScore, state } = req.body;

    const existing = await Driver.findOne({ where: { licenseNo } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'License number already registered.' });
    }

    const driver = await Driver.create({
      name,
      licenseNo,
      licenseCategory,
      licenseExpiry,
      contactNo,
      safetyScore,
      state
    });

    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    const { name, licenseNo, licenseCategory, licenseExpiry, contactNo, safetyScore, state } = req.body;

    if (licenseNo && licenseNo !== driver.licenseNo) {
      const existing = await Driver.findOne({ where: { licenseNo } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'License number already registered.' });
      }
    }

    await driver.update({
      name,
      licenseNo,
      licenseCategory,
      licenseExpiry,
      contactNo,
      safetyScore,
      state
    });

    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    // Check if the driver is currently assigned to active trips
    const activeTrips = await Trip.findOne({ 
      where: { driverId: driver.id, state: ['draft', 'dispatched'] } 
    });
    if (activeTrips) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete driver. They are currently associated with an active/dispatched trip.' 
      });
    }

    await driver.destroy();
    res.status(200).json({ success: true, message: 'Driver deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
