var express = require("express");
const authenticationController = require("../controllers/authentication.controller");
const { validate } = require("../common/validation.account");
const { auth } = require("../common/verify.token");
var router = express.Router();

/* POST username, password and login */
router.post("/login", validate.validateLogin(), authenticationController.login);

/* GET login or not */
router.get("/login", auth, authenticationController.checkLogin);

/* GET activate account */
router.post("/verify-account", authenticationController.verifyAccount);

/* POST info and register */
router.post(
  "/register",
  validate.validateRegisterAccount(),
  authenticationController.register
);

/* Forgot password */
router.post("/forgot-password", authenticationController.forgotPassword)

/* Reset password */
router.post("/reset-password", authenticationController.forgotPassword)

module.exports = router;
