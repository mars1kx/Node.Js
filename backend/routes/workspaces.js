const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, workspaceController.getAllWorkspaces);

module.exports = router;

