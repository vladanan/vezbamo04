const express = require('express');
const zadaciController = require('../controllers/zadaciController');

const router = express.Router();

router.get('/', zadaciController.zadaci);
router.get('/o1m_1_10', zadaciController.o1m_1_10);
router.get('/o1m_1_10txt', zadaciController.o1m_1_10txt);
router.get('/s1m_kombi', zadaciController.s1m_kombi);

module.exports = router;