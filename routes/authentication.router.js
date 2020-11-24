var express = require('express');
const authenticationController = require('../controllers/authentication.controller');
const {validate} = require('../common/validation.account');
const { auth } = require('../common/verify.token');
var router = express.Router();

/* POST username, password and login */
router.post('/login', validate.validateLogin(),authenticationController.login)

/* POST info and register */
router.post('/register', validate.validateRegisterAccount(),authenticationController.register)

/* GET login or not */
router.get('/login', auth, authenticationController.checkLogin)

/* GET activate account */
router.get('/activate/:verifyToken', authenticationController.activateAccount)

module.exports = router;