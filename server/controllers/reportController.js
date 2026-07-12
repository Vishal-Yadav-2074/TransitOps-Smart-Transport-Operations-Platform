const { Vehicle, Driver, Trip, Maintenance, Expense } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core Counts
    const vehicleCount = await Vehicle.count();
    const activeVehicles = await Vehicle.count({ where: { state: 'on_trip' } });
    const shopVehicles = await Vehicle.count({ where: { state: 'in_shop' } });
    const driverCount = await Driver.count();
    const activeDrivers = await Driver.count({ where: { state: 'on_trip' } });

    // 2. Compute date for today matching local timezone (IST etc.)
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    const todayStr = localISOTime;

    // Today boundaries for timestamp searches
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay = new Date(todayStr + 'T23:59:59.999Z');

    // Trips today
    const tripsTodayCount = await Trip.count({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const tripsToday = await Trip.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });
    const revenueToday = tripsToday.reduce((acc, t) => acc + parseFloat(t.revenue || 0), 0);

    // Fleet utilization %
    const fleetUtilization = vehicleCount > 0 ? parseFloat(((activeVehicles / vehicleCount) * 100).toFixed(1)) : 0;

    // Fuel cost today
    const fuelExpensesToday = await Expense.findAll({
      where: {
        expenseType: 'fuel',
        date: todayStr
      }
    });
    const fuelCostToday = fuelExpensesToday.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);

    // Expiring licenses within 30 days
    const driversListAll = await Driver.findAll();
    const todayDate = new Date(todayStr);
    const thirtyDaysFromNow = new Date(todayDate);
    thirtyDaysFromNow.setDate(todayDate.getDate() + 30);

    const expiringDrivers = driversListAll.filter(d => {
      const expiry = new Date(d.licenseExpiry);
      return expiry <= thirtyDaysFromNow;
    });
    const expiringDriversCount = expiringDrivers.length;

    // 3. Financial Metrics Sums
    const vehiclesList = await Vehicle.findAll({
      include: [
        { model: Maintenance, as: 'Maintenances' },
        { model: Expense, as: 'Expenses' },
        { model: Trip, as: 'Trips' }
      ]
    });

    let totalAcquisitionCost = 0;
    let totalOperationalCost = 0;
    let totalRevenue = 0;
    
    // Breakdown calculations
    let totalMaintenance = 0;
    let totalFuel = 0;
    let totalTolls = 0;
    let totalOther = 0;

    vehiclesList.forEach(v => {
      const vJSON = v.toJSON();
      totalAcquisitionCost += parseFloat(vJSON.acquisitionCost || 0);
      totalOperationalCost += parseFloat(vJSON.operationalCost || 0);
      totalRevenue += parseFloat(vJSON.revenue || 0);

      // Summarize types
      (vJSON.Maintenances || []).forEach(m => {
        totalMaintenance += parseFloat(m.cost || 0);
      });
      (vJSON.Expenses || []).forEach(e => {
        if (e.expenseType === 'fuel') totalFuel += parseFloat(e.amount || 0);
        else if (e.expenseType === 'toll') totalTolls += parseFloat(e.amount || 0);
        else totalOther += parseFloat(e.amount || 0);
      });
    });

    const netProfit = totalRevenue - totalOperationalCost;
    const overallRoi = totalAcquisitionCost > 0 ? (totalRevenue - totalOperationalCost) / totalAcquisitionCost : 0;

    // 4. Leaderboard of Top Vehicles by ROI
    const leaderboard = vehiclesList
      .map(v => {
        const vJSON = v.toJSON();
        return {
          id: vJSON.id,
          name: vJSON.name,
          registrationNo: vJSON.registrationNo,
          roi: vJSON.vehicleRoi,
          revenue: vJSON.revenue,
          cost: vJSON.operationalCost
        };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          vehicles: vehicleCount,
          activeVehicles,
          shopVehicles,
          drivers: driverCount,
          activeDrivers,
          tripsToday: tripsTodayCount,
          fleetUtilization,
          vehiclesInMaintenance: shopVehicles,
          expiringDrivers: expiringDriversCount
        },
        financials: {
          totalAcquisitionCost,
          totalOperationalCost,
          totalRevenue,
          netProfit,
          overallRoi,
          fuelCostToday,
          revenueToday
        },
        expenseBreakdown: {
          maintenance: totalMaintenance,
          fuel: totalFuel,
          tolls: totalTolls,
          other: totalOther
        },
        leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};
