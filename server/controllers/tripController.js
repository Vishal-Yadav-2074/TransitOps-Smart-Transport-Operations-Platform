const { Trip, Vehicle, Driver } = require('../models');

exports.getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { model: Vehicle, as: 'Vehicle', attributes: ['id', 'name', 'registrationNo', 'maxCapacity'] },
        { model: Driver, as: 'Driver', attributes: ['id', 'name', 'licenseNo', 'state'] }
      ]
    });
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    next(error);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Vehicle, as: 'Vehicle' },
        { model: Driver, as: 'Driver' }
      ]
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

exports.createTrip = async (req, res, next) => {
  try {
    const { source, dest, vehicleId, driverId, cargoWeight, plannedDist, revenue } = req.body;

    // Fetch vehicle & check capacity limit
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    if (parseFloat(cargoWeight) > parseFloat(vehicle.maxCapacity)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg).` 
      });
    }

    // Fetch driver & verify compliance
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }
    if (!driver.checkCompliance()) {
      return res.status(400).json({ 
        success: false, 
        message: `Driver ${driver.name} is not compliant (expired license, suspended, or off-duty).` 
      });
    }

    // Auto-generate name TRIP/001
    const count = await Trip.count();
    const name = `TRIP/${String(count + 1).padStart(3, '0')}`;

    const trip = await Trip.create({
      name,
      source,
      dest,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDist,
      revenue: revenue || 0.00,
      state: 'draft'
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.state !== 'draft') {
      return res.status(400).json({ success: false, message: 'Cannot edit trip. Only draft trips are editable.' });
    }

    const { source, dest, vehicleId, driverId, cargoWeight, plannedDist, revenue } = req.body;

    // Handle vehicle validation if changed
    let vId = vehicleId || trip.vehicleId;
    let cWeight = cargoWeight !== undefined ? cargoWeight : trip.cargoWeight;
    const vehicle = await Vehicle.findByPk(vId);
    if (vehicle && parseFloat(cWeight) > parseFloat(vehicle.maxCapacity)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cargo weight exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg).` 
      });
    }

    // Handle driver validation if changed
    let dId = driverId || trip.driverId;
    const driver = await Driver.findByPk(dId);
    if (driver && dId !== trip.driverId && !driver.checkCompliance()) {
      return res.status(400).json({ 
        success: false, 
        message: `Driver is not compliant.` 
      });
    }

    await trip.update({
      source,
      dest,
      vehicleId: vId,
      driverId: dId,
      cargoWeight: cWeight,
      plannedDist,
      revenue
    });

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};

exports.dispatchTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.state !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft trips can be dispatched.' });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    // Double check state locks
    if (vehicle.state !== 'available') {
      return res.status(400).json({ success: false, message: 'Vehicle is not currently available.' });
    }
    if (driver.state !== 'available') {
      return res.status(400).json({ success: false, message: 'Driver is not currently available.' });
    }
    if (!driver.checkCompliance()) {
      return res.status(400).json({ success: false, message: 'Driver is not compliant for dispatching.' });
    }

    // Mark states
    await vehicle.update({ state: 'on_trip' });
    await driver.update({ state: 'on_trip' });
    await trip.update({ state: 'dispatched' });

    res.status(200).json({ success: true, message: 'Trip dispatched successfully.', data: trip });
  } catch (error) {
    next(error);
  }
};

exports.completeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.state !== 'dispatched') {
      return res.status(400).json({ success: false, message: 'Only dispatched trips can be marked as completed.' });
    }

    const vehicle = await Vehicle.findByPk(trip.vehicleId);
    const driver = await Driver.findByPk(trip.driverId);

    await vehicle.update({ state: 'available' });
    await driver.update({ state: 'available' });
    await trip.update({ state: 'completed' });

    res.status(200).json({ success: true, message: 'Trip completed successfully.', data: trip });
  } catch (error) {
    next(error);
  }
};

exports.cancelTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.state !== 'draft' && trip.state !== 'dispatched') {
      return res.status(400).json({ success: false, message: 'Trip cannot be cancelled in its current state.' });
    }

    // Revert vehicle/driver state if dispatched
    if (trip.state === 'dispatched') {
      const vehicle = await Vehicle.findByPk(trip.vehicleId);
      const driver = await Driver.findByPk(trip.driverId);
      await vehicle.update({ state: 'available' });
      await driver.update({ state: 'available' });
    }

    await trip.update({ state: 'cancelled' });
    res.status(200).json({ success: true, message: 'Trip cancelled successfully.', data: trip });
  } catch (error) {
    next(error);
  }
};
