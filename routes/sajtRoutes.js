const express = require('express');
const sajtController = require('../controllers/sajtController');

const router = express.Router();

router.get('/about', sajtController.about);
router.get('/kontakt', sajtController.kontakt);
router.get('/faq', sajtController.faq);
router.get('/privacy', sajtController.privacy);
router.get('/terms', sajtController.terms);
router.get('/reg', sajtController.reg);
router.get('/login', sajtController.login);
router.post('/fileupload', sajtController.fileupload);

router.get('/user', sajtController.user);
router.post('/user', sajtController.user_post);

router.get('/probe', sajtController.probe);

module.exports = router;