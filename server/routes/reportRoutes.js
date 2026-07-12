const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for analytics queries

router.get('/stats', authorizeRoles('Fleet Manager', 'Financial Analyst', 'Safety Officer'), reportController.getDashboardStats);

module.exports = router;
