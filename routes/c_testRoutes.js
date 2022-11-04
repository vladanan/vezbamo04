const express = require('express');
const c_testController = require('../controllers/c_testController');

const router = express.Router();

router.get('/c_tests', c_testController.c_tests_get);
router.get('/c_test', c_testController.c_test_get);

router.get('/create', c_testController.c_test_create_get);
router.post('/create', c_testController.c_test_create_post);


module.exports = router;