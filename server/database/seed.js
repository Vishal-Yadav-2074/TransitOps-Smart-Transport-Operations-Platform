const { Vehicle, Driver, Trip, Maintenance, Expense } = require('../models');

async function seedIndianTransportData() {
  try {
    const existingVehicle = await Vehicle.findOne({ where: { registrationNo: 'GJ-01-AB-4587' } });
    if (existingVehicle) {
      console.log('[Seed Logger]: Indian transport seed data already present.');
      return;
    }

    // Clear old demo tables to ensure clean Indian dataset
    await Expense.destroy({ where: {}, truncate: true }).catch(() => {});
    await Maintenance.destroy({ where: {}, truncate: true }).catch(() => {});
    await Trip.destroy({ where: {}, truncate: true }).catch(() => {});
    await Driver.destroy({ where: {}, truncate: true }).catch(() => {});
    await Vehicle.destroy({ where: {}, truncate: true }).catch(() => {});

    console.log('[Seed Logger]: Seeding Indian transport & logistics data...');

    // 1. Seed Indian Vehicles
    const vehicles = await Vehicle.bulkCreate([
      {
        name: 'Ashok Leyland 2820',
        registrationNo: 'GJ-01-AB-4587',
        vehicleType: 'heavy_hauler',
        maxCapacity: 25000,
        odometer: 142500,
        acquisitionCost: 3800000,
        state: 'on_trip'
      },
      {
        name: 'Tata Prima 5530.S',
        registrationNo: 'GJ-18-KL-2281',
        vehicleType: 'heavy_hauler',
        maxCapacity: 35000,
        odometer: 189200,
        acquisitionCost: 4500000,
        state: 'on_trip'
      },
      {
        name: 'BharatBenz 3528R',
        registrationNo: 'MH-12-TR-8541',
        vehicleType: 'heavy_hauler',
        maxCapacity: 28000,
        odometer: 98400,
        acquisitionCost: 4100000,
        state: 'available'
      },
      {
        name: 'Mahindra Blazo X',
        registrationNo: 'RJ-14-TA-2298',
        vehicleType: 'cargo_truck',
        maxCapacity: 18000,
        odometer: 64100,
        acquisitionCost: 3200000,
        state: 'on_trip'
      },
      {
        name: 'Eicher Pro 6048',
        registrationNo: 'KA-03-HA-8877',
        vehicleType: 'heavy_hauler',
        maxCapacity: 30000,
        odometer: 210500,
        acquisitionCost: 4200000,
        state: 'in_shop'
      },
      {
        name: 'Tata Ultra 1918',
        registrationNo: 'DL-01-CV-9821',
        vehicleType: 'cargo_truck',
        maxCapacity: 12000,
        odometer: 45200,
        acquisitionCost: 2200000,
        state: 'available'
      },
      {
        name: 'Force Traveller',
        registrationNo: 'GJ-06-MP-3344',
        vehicleType: 'van',
        maxCapacity: 3500,
        odometer: 32100,
        acquisitionCost: 1400000,
        state: 'available'
      },
      {
        name: 'Mahindra Bolero Pickup',
        registrationNo: 'GJ-05-XY-1122',
        vehicleType: 'van',
        maxCapacity: 1700,
        odometer: 54000,
        acquisitionCost: 950000,
        state: 'available'
      },
      {
        name: 'Tata Ace Gold',
        registrationNo: 'GJ-27-BA-9911',
        vehicleType: 'van',
        maxCapacity: 900,
        odometer: 28000,
        acquisitionCost: 550000,
        state: 'available'
      },
      {
        name: 'Ashok Leyland Dost',
        registrationNo: 'GJ-03-CD-4455',
        vehicleType: 'van',
        maxCapacity: 1500,
        odometer: 39000,
        acquisitionCost: 780000,
        state: 'available'
      }
    ]);

    // 2. Seed Indian Drivers
    const drivers = await Driver.bulkCreate([
      {
        name: 'Rahul Patel',
        licenseNo: 'GJ-01-2018-0045871',
        licenseCategory: 'Heavy Transport (HTV)',
        licenseExpiry: '2028-11-15',
        contactNo: '+91 9876543210',
        safetyScore: 98.5,
        state: 'on_trip'
      },
      {
        name: 'Vishal Yadav',
        licenseNo: 'MH-12-2019-0098542',
        licenseCategory: 'Heavy Goods Vehicle (HGV)',
        licenseExpiry: '2027-04-20',
        contactNo: '+91 9825012345',
        safetyScore: 96.0,
        state: 'on_trip'
      },
      {
        name: 'Shubham Prajapati',
        licenseNo: 'GJ-18-2020-0033281',
        licenseCategory: 'Commercial Heavy (CH)',
        licenseExpiry: '2026-08-10',
        contactNo: '+91 9900090009',
        safetyScore: 94.2,
        state: 'available'
      },
      {
        name: 'Amit Kumar',
        licenseNo: 'DL-01-2017-0012984',
        licenseCategory: 'Heavy Transport (HTV)',
        licenseExpiry: '2029-01-05',
        contactNo: '+91 9811122233',
        safetyScore: 97.8,
        state: 'on_trip'
      },
      {
        name: 'Rakesh Singh',
        licenseNo: 'RJ-14-2016-0077412',
        licenseCategory: 'Heavy Transport (HTV)',
        licenseExpiry: '2026-07-28',
        contactNo: '+91 9722233344',
        safetyScore: 89.0,
        state: 'off_duty'
      },
      {
        name: 'Mohit Sharma',
        licenseNo: 'KA-03-2021-0066554',
        licenseCategory: 'Light Transport (LMV-TR)',
        licenseExpiry: '2030-05-18',
        contactNo: '+91 9633344455',
        safetyScore: 95.5,
        state: 'available'
      },
      {
        name: 'Suresh Chauhan',
        licenseNo: 'GJ-05-2019-0088112',
        licenseCategory: 'Heavy Transport (HTV)',
        licenseExpiry: '2027-12-01',
        contactNo: '+91 9544455566',
        safetyScore: 92.1,
        state: 'available'
      },
      {
        name: 'Kiran Parmar',
        licenseNo: 'GJ-06-2022-0044991',
        licenseCategory: 'Commercial Medium',
        licenseExpiry: '2028-09-14',
        contactNo: '+91 9455566677',
        safetyScore: 91.0,
        state: 'available'
      },
      {
        name: 'Jay Patel',
        licenseNo: 'GJ-27-2020-0011223',
        licenseCategory: 'Light Commercial (LMV)',
        licenseExpiry: '2031-03-30',
        contactNo: '+91 9366677788',
        safetyScore: 96.8,
        state: 'available'
      },
      {
        name: 'Harsh Desai',
        licenseNo: 'GJ-03-2021-0099887',
        licenseCategory: 'Heavy Transport (HTV)',
        licenseExpiry: '2029-10-25',
        contactNo: '+91 9277788899',
        safetyScore: 93.4,
        state: 'available'
      }
    ]);

    // 3. Seed Trips
    const trips = await Trip.bulkCreate([
      {
        tripCode: 'TRIP/2026/001',
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        origin: 'Ahmedabad',
        destination: 'Surat',
        distanceKm: 270,
        cargoDescription: 'Industrial Machinery Parts',
        cargoWeightKg: 18500,
        revenue: 48500,
        state: 'dispatched'
      },
      {
        tripCode: 'TRIP/2026/002',
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        origin: 'Mumbai',
        destination: 'Pune',
        distanceKm: 148,
        cargoDescription: 'Pharmaceutical Supplies',
        cargoWeightKg: 22000,
        revenue: 32000,
        state: 'dispatched'
      },
      {
        tripCode: 'TRIP/2026/003',
        vehicleId: vehicles[3].id,
        driverId: drivers[3].id,
        origin: 'Ahmedabad',
        destination: 'Rajkot',
        distanceKm: 215,
        cargoDescription: 'Textile & Cotton Bales',
        cargoWeightKg: 12000,
        revenue: 26000,
        state: 'dispatched'
      },
      {
        tripCode: 'TRIP/2026/004',
        vehicleId: vehicles[2].id,
        driverId: drivers[2].id,
        origin: 'Delhi',
        destination: 'Jaipur',
        distanceKm: 280,
        cargoDescription: 'Auto Components & Spares',
        cargoWeightKg: 15000,
        revenue: 42000,
        state: 'completed'
      }
    ]);

    // 4. Seed Maintenances
    await Maintenance.bulkCreate([
      {
        vehicleId: vehicles[4].id, // Eicher Pro 6048 (in_shop)
        serviceTitle: 'Engine & Turbo Overhaul',
        serviceType: 'engine',
        workshopName: 'Tata Authorized Service Center',
        cost: 48500,
        date: new Date().toISOString().slice(0, 10),
        status: 'in_progress',
        notes: '30,000 km routine engine tuning, synthetic oil replacement & injector calibration.'
      },
      {
        vehicleId: vehicles[0].id,
        serviceTitle: 'JK Heavy Tyre Replacement (Set of 6)',
        serviceType: 'tires',
        workshopName: 'JK Tyre Center',
        cost: 62000,
        date: new Date().toISOString().slice(0, 10),
        status: 'completed',
        notes: 'Full set replacement with JK JETSTEEL JDH X heavy duty radial commercial tires.'
      },
      {
        vehicleId: vehicles[1].id,
        serviceTitle: 'Brake Pad & Air System Servicing',
        serviceType: 'brakes',
        workshopName: 'Ashok Leyland Workshop',
        cost: 18200,
        date: new Date().toISOString().slice(0, 10),
        status: 'completed',
        notes: 'Replaced front air brake drum liners and pneumatic pressure check.'
      }
    ]);

    // 5. Seed Expenses
    await Expense.bulkCreate([
      {
        vehicleId: vehicles[0].id,
        expenseType: 'fuel',
        amount: 18420,
        liters: 199.25,
        date: new Date().toISOString().slice(0, 10),
        description: 'Diesel fuel refill @ ₹92.45/L (Indian Oil Corporation Hub - SG Highway)'
      },
      {
        vehicleId: vehicles[0].id,
        expenseType: 'tolls',
        amount: 3250,
        date: new Date().toISOString().slice(0, 10),
        description: 'FASTag toll plaza deduction (NE-1 Vadodara Expressway Plaza)'
      },
      {
        vehicleId: vehicles[1].id,
        expenseType: 'fuel',
        amount: 12500,
        liters: 135.20,
        date: new Date().toISOString().slice(0, 10),
        description: 'Diesel fuel refill @ ₹92.45/L (Bharat Petroleum Highway Plaza - Vapi)'
      }
    ]);

    console.log('[Seed Logger]: Indian transport data successfully seeded into database!');
  } catch (error) {
    console.error('[Seed Error]: Failed to seed Indian transport data:', error);
  }
}

module.exports = { seedIndianTransportData };
