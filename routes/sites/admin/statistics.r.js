const express = require("express");
const router = express.Router();
const statisticsController = require('../../../controllers/sites/admin/statistics.c')

router.get('/statistics', statisticsController.showStatistics)
router.get('/', statisticsController.showStatistics)
module.exports = router;