const { Maintenance, Vehicle } = require('../models');

exports.getAllMaintenances = async (req, res, next) => {
  try {
    const logs = await Maintenance.findAll({
      include: [{ model: Vehicle, as: 'Vehicle', attributes: ['id', 'name', 'registrationNo'] }]
    });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.createMaintenance = async (req, res, next) => {
  try {
    const { name, vehicleId, cost, date, state } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const log = await Maintenance.create({
      name,
      vehicleId,
      cost,
      date,
      state: state || 'open'
    });

    // If open, set vehicle to in_shop
    if (log.state === 'open') {
      await vehicle.update({ state: 'in_shop' });
    }

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.updateMaintenance = async (req, res, next) => {
  try {
    const log = await Maintenance.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    const oldState = log.state;
    const oldVehicleId = log.vehicleId;
    const { name, vehicleId, cost, date, state } = req.body;

    await log.update({
      name,
      vehicleId,
      cost,
      date,
      state
    });

    const activeVehicleId = vehicleId || oldVehicleId;
    const vehicle = await Vehicle.findByPk(activeVehicleId);

    if (vehicle) {
      if (log.state === 'open') {
        await vehicle.update({ state: 'in_shop' });
      } else if (log.state === 'closed' && (oldState === 'open' || activeVehicleId !== oldVehicleId)) {
        // Revert to available only if there are no other open maintenances on the same vehicle
        const otherOpen = await Maintenance.findOne({
          where: { vehicleId: activeVehicleId, state: 'open' }
        });
        if (!otherOpen) {
          await vehicle.update({ state: 'available' });
        }
      }
    }

    res.status(200).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

exports.deleteMaintenance = async (req, res, next) => {
  try {
    const log = await Maintenance.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
    }

    const vehicleId = log.vehicleId;
    const wasOpen = log.state === 'open';

    await log.destroy();

    // If the deleted record was open, double check if vehicle should be reverted
    if (wasOpen) {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (vehicle) {
        const otherOpen = await Maintenance.findOne({
          where: { vehicleId, state: 'open' }
        });
        if (!otherOpen) {
          await vehicle.update({ state: 'available' });
        }
      }
    }

    res.status(200).json({ success: true, message: 'Maintenance record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
