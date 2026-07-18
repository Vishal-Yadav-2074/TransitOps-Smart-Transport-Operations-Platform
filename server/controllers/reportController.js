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
      },
      include: [
        { model: Vehicle, as: 'Vehicle', attributes: ['id', 'name', 'registrationNo'] },
        { model: Driver, as: 'Driver', attributes: ['id', 'name'] }
      ]
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

    // Other expenses today
    const otherExpensesToday = await Expense.findAll({
      where: {
        expenseType: { [Op.ne]: 'fuel' },
        date: todayStr
      }
    });
    const otherExpensesTodayCost = otherExpensesToday.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);

    // Maintenance cost logged today
    const maintenanceToday = await Maintenance.findAll({
      where: {
        date: todayStr
      }
    });
    const maintenanceTodayCost = maintenanceToday.reduce((acc, m) => acc + parseFloat(m.cost || 0), 0);

    const totalExpensesToday = fuelCostToday + otherExpensesTodayCost + maintenanceTodayCost;
    const profitToday = revenueToday - totalExpensesToday;

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

    // 4. Group data for monthly charts (Revenue vs Expenses, Fuel, Maintenance)
    const allTrips = await Trip.findAll();
    const allExpenses = await Expense.findAll();
    const allMaintenances = await Maintenance.findAll();

    const monthsMap = {}; // { 'YYYY-MM': { month, revenue, fuel, maintenance, totalExpense } }

    // Helper to initialize month
    const initMonth = (mStr) => {
      if (!monthsMap[mStr]) {
        monthsMap[mStr] = { month: mStr, revenue: 0, fuel: 0, maintenance: 0, totalExpense: 0, tripsCount: 0 };
      }
    };

    allTrips.forEach(t => {
      if (t.state === 'completed' || t.state === 'dispatched') {
        const dateObj = new Date(t.createdAt);
        const monthStr = dateObj.toISOString().substring(0, 7); // 'YYYY-MM'
        initMonth(monthStr);
        monthsMap[monthStr].revenue += parseFloat(t.revenue || 0);
        monthsMap[monthStr].tripsCount += 1;
      }
    });

    allExpenses.forEach(e => {
      if (e.date) {
        const monthStr = e.date.substring(0, 7);
        initMonth(monthStr);
        if (e.expenseType === 'fuel') {
          monthsMap[monthStr].fuel += parseFloat(e.amount || 0);
        }
        monthsMap[monthStr].totalExpense += parseFloat(e.amount || 0);
      }
    });

    allMaintenances.forEach(m => {
      if (m.date) {
        const monthStr = m.date.substring(0, 7);
        initMonth(monthStr);
        monthsMap[monthStr].maintenance += parseFloat(m.cost || 0);
        monthsMap[monthStr].totalExpense += parseFloat(m.cost || 0);
      }
    });

    const monthlyFinancials = Object.values(monthsMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    // Trip Status Distribution
    const tripStatusDistribution = [
      { name: 'Draft', value: await Trip.count({ where: { state: 'draft' } }) },
      { name: 'Dispatched', value: await Trip.count({ where: { state: 'dispatched' } }) },
      { name: 'Completed', value: await Trip.count({ where: { state: 'completed' } }) },
      { name: 'Cancelled', value: await Trip.count({ where: { state: 'cancelled' } }) }
    ].filter(d => d.value > 0);

    // Vehicle Utilization
    const vehicleUtilization = [
      { name: 'Available', value: await Vehicle.count({ where: { state: 'available' } }) },
      { name: 'On Trip', value: await Vehicle.count({ where: { state: 'on_trip' } }) },
      { name: 'In Shop', value: await Vehicle.count({ where: { state: 'in_shop' } }) }
    ].filter(d => d.value > 0);

    // 5. Leaderboard of Top Vehicles by ROI
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

    // Gather Recent Activities for live dispatch log
    const recentVehicles = await Vehicle.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const recentDrivers = await Driver.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const recentTrips = await Trip.findAll({ order: [['updatedAt', 'DESC']], limit: 10 });
    const recentExpenses = await Expense.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
    const recentMaintenances = await Maintenance.findAll({ order: [['updatedAt', 'DESC']], limit: 10 });

    const activities = [];

    recentVehicles.forEach(v => {
      activities.push({
        text: `Vehicle Added: ${v.name} (${v.registrationNo})`,
        timestamp: v.createdAt,
        type: 'vehicle',
        color: 'bg-indigo-500 text-white'
      });
    });

    recentDrivers.forEach(d => {
      activities.push({
        text: `Driver Added: ${d.name}`,
        timestamp: d.createdAt,
        type: 'driver',
        color: 'bg-emerald-500 text-white'
      });
    });

    recentTrips.forEach(t => {
      let text = '';
      if (t.state === 'draft') text = `Trip Booked: ${t.name} (${t.source} ➔ ${t.dest})`;
      else if (t.state === 'dispatched') text = `Trip Dispatched: ${t.name} (${t.source} ➔ ${t.dest})`;
      else if (t.state === 'completed') text = `Trip Completed: ${t.name} (${t.source} ➔ ${t.dest})`;
      else if (t.state === 'cancelled') text = `Trip Cancelled: ${t.name}`;
      
      activities.push({
        text,
        timestamp: t.updatedAt,
        type: 'trip',
        color: t.state === 'completed' ? 'bg-emerald-600 text-white' : t.state === 'dispatched' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'
      });
    });

    recentExpenses.forEach(e => {
      activities.push({
        text: `${e.expenseType.charAt(0).toUpperCase() + e.expenseType.slice(1)} Expense Added: ₹${parseFloat(e.amount).toLocaleString('en-IN')} (${e.name})`,
        timestamp: e.createdAt,
        type: 'expense',
        color: 'bg-amber-600 text-white'
      });
    });

    recentMaintenances.forEach(m => {
      let text = '';
      if (m.state === 'open') text = `Maintenance Started: ${m.name}`;
      else text = `Maintenance Closed: ${m.name}`;
      
      activities.push({
        text,
        timestamp: m.updatedAt,
        type: 'maintenance',
        color: m.state === 'open' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const sortedActivities = activities.slice(0, 15).map(act => {
      const d = new Date(act.timestamp);
      let timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      const todayDateStr = new Date().toDateString();
      if (d.toDateString() !== todayDateStr) {
        timeStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + timeStr;
      }
      return {
        time: timeStr,
        text: act.text,
        type: act.type,
        color: act.color,
        timestamp: act.timestamp
      };
    });

    const vehiclesInMaintenanceList = vehiclesList.filter(v => v.state === 'in_shop');

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
          revenueToday,
          profitToday
        },
        expenseBreakdown: {
          maintenance: totalMaintenance,
          fuel: totalFuel,
          tolls: totalTolls,
          other: totalOther
        },
        tripStatusDistribution,
        vehicleUtilization,
        monthlyFinancials,
        leaderboard,
        activities: sortedActivities,
        tripsTodayList: tripsToday,
        expiringDriversList: expiringDrivers,
        vehiclesInMaintenanceList: vehiclesInMaintenanceList
      }
    });
  } catch (error) {
    next(error);
  }
};

const nodemailer = require('nodemailer');

exports.triggerEmailReminders = async (req, res, next) => {
  try {
    const drivers = await Driver.findAll();
    const vehicles = await Vehicle.findAll();
    
    // Find expiring licenses within 30 days
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiringDrivers = drivers.filter(d => {
      const expiry = new Date(d.licenseExpiry);
      return expiry <= thirtyDaysFromNow;
    });

    // Find vehicles in shop (maintenance due / active)
    const activeMaintenances = vehicles.filter(v => v.state === 'in_shop');

    // Compile email content
    let emailBody = `<h1>TransitOps Operational Summary Report & Alerts</h1>`;
    
    if (expiringDrivers.length > 0) {
      emailBody += `<h2>⚠️ LICENSE EXPIRATION REMINDERS</h2><ul>`;
      expiringDrivers.forEach(d => {
        emailBody += `<li>Driver <strong>${d.name}</strong> - License: <code>${d.licenseNo}</code> expires on <strong>${d.licenseExpiry}</strong></li>`;
      });
      emailBody += `</ul>`;
    } else {
      emailBody += `<p>🟢 No driver licenses expiring within 30 days.</p>`;
    }

    if (activeMaintenances.length > 0) {
      emailBody += `<h2>🔧 ACTIVE MAINTENANCE LOCKOUTS</h2><ul>`;
      activeMaintenances.forEach(v => {
        emailBody += `<li>Vehicle <strong>${v.name}</strong> (Reg No: <code>${v.registrationNo}</code>) is currently locked out in the workshop.</li>`;
      });
      emailBody += `</ul>`;
    } else {
      emailBody += `<p>🟢 No vehicles currently logged in shop maintenance.</p>`;
    }

    // Config Nodemailer Transporter
    // Use environment SMTP variables or create an Ethereal SMTP test account
    let transporter;
    const isMock = !process.env.SMTP_HOST;

    if (isMock) {
      // Mock transporter printing to console
      transporter = {
        sendMail: async (options) => {
          console.log('\n================================ MOCK OPERATIONAL REMINDER EMAIL ================================');
          console.log(`From: ${options.from}`);
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body (HTML):\n${options.html}`);
          console.log('==================================================================================================\n');
          return { messageId: 'mock_msg_' + Math.random().toString(36).substring(7), mockUsed: true };
        }
      };
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TransitOps Alerts" <alerts@transitops.com>',
      to: req.user?.email || 'manager@transitops.com',
      subject: `[TransitOps COMMAND] Fleet Operations Reminders & Expiries - ${new Date().toLocaleDateString('en-IN')}`,
      html: emailBody
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: isMock ? 'Mock operational reminder email logged to server console.' : 'Operational reminder emails dispatched successfully.',
      data: {
        mockUsed: isMock,
        messageId: info.messageId,
        alertCounts: {
          expiringLicenses: expiringDrivers.length,
          activeMaintenances: activeMaintenances.length
        }
      }
    });

  } catch (error) {
    next(error);
  }
};
