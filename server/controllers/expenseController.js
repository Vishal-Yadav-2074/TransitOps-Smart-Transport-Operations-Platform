const { Expense, Vehicle } = require('../models');

exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({
      include: [{ model: Vehicle, as: 'Vehicle', attributes: ['id', 'name', 'registrationNo'] }]
    });
    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    next(error);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { name, vehicleId, expenseType, amount, date } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const expense = await Expense.create({
      name,
      vehicleId,
      expenseType,
      amount,
      date
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const { name, vehicleId, expenseType, amount, date } = req.body;

    await expense.update({
      name,
      vehicleId,
      expenseType,
      amount,
      date
    });

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    await expense.destroy();
    res.status(200).json({ success: true, message: 'Expense record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
