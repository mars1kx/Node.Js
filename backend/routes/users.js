const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', userController.getAllUsers);

router.put('/:id/role', userController.updateUserRole);

module.exports = router;
