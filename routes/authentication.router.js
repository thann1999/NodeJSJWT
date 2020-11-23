var express = require('express');
const authenticationController = require('../controllers/authentication.controller');
var router = express.Router();

/* POST username, password and login */
router.post('/login', authenticationController.login)

/* POST info and register */
router.post('/register', authenticationController.register)

router.post('/news', authenticationController.verifyToken, authenticationController.postNews)


module.exports = router;