const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const userController = require('../controllers/userController');

router.get('/', auth, userController.getAllUsers);
router.get('/me', auth, userController.getMyProfile);
router.get('/:id', auth, role('admin'), userController.getUserById);
router.put('/:id', auth, role('admin'), userController.updateUser);
router.put('/:id/salary', auth, role('admin'), userController.updateSalary);

module.exports = router;