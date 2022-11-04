const express = require('express');
const pitanjaController = require('../controllers/pitanjaController');

const router = express.Router();

router.get('/pitanja', pitanjaController.pitanja_get);
router.post('/pitanja', pitanjaController.pitanja_post);
router.get('/create', pitanjaController.pitanja_create_get);
router.post('/create', pitanjaController.pitanja_create_post);


module.exports = router;