const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for all expense endpoints

router.get('/', expenseController.getAllExpenses);
router.post('/', authorizeRoles('Fleet Manager', 'Financial Analyst'), expenseController.createExpense);
router.put('/:id', authorizeRoles('Fleet Manager', 'Financial Analyst'), expenseController.updateExpense);
router.delete('/:id', authorizeRoles('Fleet Manager', 'Financial Analyst'), expenseController.deleteExpense);

module.exports = router;
