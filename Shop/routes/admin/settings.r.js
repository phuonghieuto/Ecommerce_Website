const express = require("express");
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.c')

router.get('/settings', settingsController.showSettings)
router.get('/', settingsController.showSettings)
module.exports = router;