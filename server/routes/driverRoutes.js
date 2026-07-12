const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for all driver endpoints

router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);

router.post('/', authorizeRoles('Fleet Manager', 'Safety Officer'), driverController.createDriver);
router.put('/:id', authorizeRoles('Fleet Manager', 'Safety Officer'), driverController.updateDriver);
router.delete('/:id', authorizeRoles('Fleet Manager'), driverController.deleteDriver);

module.exports = router;
