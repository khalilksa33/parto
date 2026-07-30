const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// POST /api/tenants/register
router.post('/register', tenantController.registerTenant);

module.exports = router;
