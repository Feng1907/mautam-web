const express = require('express');
const router  = express.Router();
const { getLoiChua } = require('../controllers/loiChuaController');

// GET /api/loi-chua?date=YYYY-MM-DD
router.get('/', getLoiChua);

module.exports = router;
