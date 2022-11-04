const express = require('express');
const ajaxController = require('../controllers/ajaxController');

const router = express.Router();

router.post('/', ajaxController.logika);

module.exports = router;