const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for all maintenance endpoints

router.get('/', maintenanceController.getAllMaintenances);
router.post('/', authorizeRoles('Fleet Manager', 'Safety Officer'), maintenanceController.createMaintenance);
router.put('/:id', authorizeRoles('Fleet Manager', 'Safety Officer'), maintenanceController.updateMaintenance);
router.delete('/:id', authorizeRoles('Fleet Manager'), maintenanceController.deleteMaintenance);

module.exports = router;
