const { check } = require("express-validator");

const validateRegisterAccount = () => {
  return [
    check("email", "email does not Empty").not().isEmpty(),
    check("email", "Email không đúng định dạng").isEmail(),
    check("username", "Tên tài khoản không được trống").not().isEmpty(),
    check(
      "username",
      "Tên tài khoản dài 6-16 ký tự, bao gồm ít nhất 1 ký tự là số, không sử dụng các ký tự đặc biệt"
    ).matches(/^[a-zA-Z0-9](?=.*\d){6,16}$/),
    check("firstName", "Họ không được trống").not().isEmpty(),
    check("lastName", "Tên không được trống").not().isEmpty(),
    validatePassword(),
  ];
};

const validatePassword = () => {
  return [
    check("password", "Mật khẩu không được trống").not().isEmpty(),
    check(
      "password",
      "Mật khẩu phải có ít nhất 6 ký tự, bao gồm ít nhất 1 ký tự là số và ký tự đặc biệt [@, $, !, %, *, #, ?, &, .]"
    ).matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{6,}$/),
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
  validatePassword: validatePassword,
};

module.exports = { validate };
