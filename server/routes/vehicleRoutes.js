const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for all vehicle endpoints

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Creation, editing, and deletion are restricted based on security clearances
router.post('/', authorizeRoles('Fleet Manager', 'Financial Analyst'), vehicleController.createVehicle);
router.put('/:id', authorizeRoles('Fleet Manager', 'Financial Analyst'), vehicleController.updateVehicle);
router.delete('/:id', authorizeRoles('Fleet Manager'), vehicleController.deleteVehicle);

module.exports = router;
