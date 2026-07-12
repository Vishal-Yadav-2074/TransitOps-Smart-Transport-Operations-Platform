const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(auth); // Require JWT for all trip endpoints

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);

router.post('/', authorizeRoles('Fleet Manager', 'Safety Officer'), tripController.createTrip);
router.put('/:id', authorizeRoles('Fleet Manager', 'Safety Officer'), tripController.updateTrip);

// Actions and workflow triggers
router.post('/:id/dispatch', authorizeRoles('Fleet Manager', 'Safety Officer'), tripController.dispatchTrip);
router.post('/:id/complete', authorizeRoles('Fleet Manager', 'Driver'), tripController.completeTrip);
router.post('/:id/cancel', authorizeRoles('Fleet Manager', 'Safety Officer'), tripController.cancelTrip);

module.exports = router;
