const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/main', adminController.main);
router.get('/update', adminController.update_get);
router.post('/update', adminController.update_post);
router.get('/del_index', adminController.del_index);
router.post('/delete', adminController.delete_rows);
router.post('/index_repair', adminController.index_repair);


module.exports = router;