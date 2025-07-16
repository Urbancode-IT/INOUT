const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const holidayController = require('../controllers/holidayController');

router.get('/', auth, holidayController.getAllHolidays);
router.post('/', auth, role('admin'), holidayController.createHoliday);

module.exports = router;