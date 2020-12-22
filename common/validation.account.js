const { check } = require("express-validator");

const validateRegisterAccount = () => {
  return [
    check("email", "email does not Empty").not().isEmpty(),
    check("email", "Invalid email").isEmail(),
    check("username", "username does not Empty").not().isEmpty(),
    check("username", "username must be Alphanumeric").isAlphanumeric(),
    check("username", "username more than 6 digits").isLength({ min: 6 }),
    check("username", "username less than 16 digits").isLength({ max: 16 }),
    check("firstName", "firstName does not Empty").not().isEmpty(),
    check("lastName", "lastName does not Empty").not().isEmpty(),
    check(
      "password",
      "Mật khẩu phải có ít nhất 6 ký tự, trong đó có ít nhất 1 ký tự là chữ và số"
    ).matches("/^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{6,}$/", "i"),
  ];
};

const validateLogin = () => {
  return [
    check("username", "username does not Empty").not().isEmpty(),
    check("password", "username does not Empty").not().isEmpty(),
  ];
};

let validate = {
  validateRegisterAccount: validateRegisterAccount,
  validateLogin: validateLogin,
};

module.exports = { validate };
