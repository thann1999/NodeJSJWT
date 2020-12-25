var express = require("express");
const authenticationController = require("../controllers/authentication.controller");
const { validate } = require("../common/validation.account");
const { auth, resetPasswordToken } = require("../common/verify.token");
const router = express.Router();
const passport = require("passport");
require("../config/passport-setup")


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
router.post("/forgot-password", authenticationController.forgotPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/failed", (req, res, next) => {
  res.status(401).send("Login failed");
});
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res
      .status(200)
      .json({ message: `Login success, Welcome ${req.user.displayName}` });
  }
);
/* Reset password */
router.post(
  "/reset-password",
  resetPasswordToken,
  validate.validatePassword(),
  authenticationController.changePassword
);

module.exports = router;
