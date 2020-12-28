const Account = require("../models/account.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const { sendEmail, createMailCode, createMailLink } = require("./send.email");
const AccountDao = require("../dao/account.dao");
const RegisterCodeDao = require("../dao/register.code.dao");
const jwt_decode = require("jwt-decode");
const { OAuth2Client } = require("google-auth-library");

/* Hashing password by SHA256 */
function hashPassword(password) {
  const hash = crypto.createHash("sha256").update(password).digest("base64");
  return hash;
}

/* Check account is correct or wrong */
async function login(req, res, next) {
  //Validate account before query
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  //Query account
  try {
    const user = await AccountDao.findAccountByUsernamePassword(
      req.body.username,
      hashPassword(req.body.password)
    );
    if (user && user.isVerify) {
      jwt.sign(
        { id: user._id, name: user.name },
        process.env.SECRET_TOKEN,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            err.status = 400;
            throw err;
          }
          res
            .status(200)
            .header("auth-token", token)
            .json({ token: token, message: user.name });
        }
      );
    } else {
      res.status(401).json({ message: "Sai tên tài khoản hoặc mật khẩu" });
    }
  } catch (error) {
    next(error);
  }
}

/* Forgot password */
async function forgotPassword(req, res, next) {
  //Send code to confirm forgot password
  const email = req.body.email;
  const result = await AccountDao.findAccountByUsernameOrEmail(email, null);
  if (!result || !result.isVerify) {
    return res.status(400).json({ message: "Email này chưa được đăng ký" });
  }
  sendEmail(createMailLink(result));
  res.status(200).json({ message: "Link đã được gửi" });
}

/* verify email to register account */
async function verifyAccount(req, res, next) {
  // Get auth header value
  const token = req.body.verifyCode;
  const accountId = req.body.accountId;
  if (!token) {
    return res.status(401).send("Từ chối truy cập");
  }
  const result = await RegisterCodeDao.findRegisterCodeByUserId(accountId);
  if (result.length === 0 || result[0].code !== token) {
    return res.status(400).json({ message: "Mã xác nhận sai" });
  } else if (result[0].isAlreadyUse) {
    return res.status(400).json({ message: "Mã xác nhận đã được sử dụng" });
  }
  //check expired code
  const minute = Math.abs(new Date() - result[0].createdDate) / (1000 * 60);
  if (minute > process.env.EXPIRE_MINUTE_REGISTER_CODE) {
    return res.status(400).json({ message: "Mã xác nhận đã quá hạn" });
  }
  const isVerify = true;
  await AccountDao.updateVerifyAccount(accountId, isVerify);
  await RegisterCodeDao.updateAlreadyUse(result[0]._id);
  res.status(200).json({ message: "Mã xác nhận đúng" });
}

/* Check login or not */
function checkLogin(req, res, next) {
  const decoded = jwt_decode(req.header("auth-token"));
  res.status(200).json({ message: decoded.name });
}

/* Register account */
async function register(req, res, next) {
  //Validate account before save into database
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const user = await AccountDao.findAccountByUsernameOrEmail(
      req.body.email,
      req.body.username
    );

    const newUser = new Account({
      email: req.body.email,
      username: req.body.username,
      password: hashPassword(req.body.password),
      name: req.body.firstName + " " + req.body.lastName,
      role: process.env.ROLE_USER,
    });

    //If account exist
    if (user) {
      if (!user.isVerify) {
        await AccountDao.deleteAccount(user.email);
      } else {
        if (user.email === newUser.email)
          return res.status(400).json({ message: "Email đã tồn tại" });
        else if (user.username === newUser.username)
          return res.status(400).json({ message: "Tên tài khoản đã tồn tại" });
      }
    }
    const result = await AccountDao.createAccount(newUser);
    sendEmail(createMailCode(result.email, result._id));
    res.status(200).json({ message: result._id });
  } catch (error) {
    next(error);
  }
}

/* Change password */
async function changePassword(req, res, next) {
  if (!req.body.newPassword) {
    return res.status(200).json({ message: "Token chính xác" });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array() });
  }
  try {
    const decoded = jwt_decode(req.header("auth-token"));
    const newPassword = req.body.newPassword;
    await AccountDao.updatePassword(decoded.accountId, newPassword);
    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
}

/* Login with google */
async function loginGoogle(req, res, next) {
  const oAuth2Client = new OAuth2Client();
  const { accessToken, profile } = req.body;
  console.log(accessToken, profile);
  try {
    const tokenInfo = await oAuth2Client.getTokenInfo(accessToken);

    res.status(200).send({ message: tokenInfo });
  } catch (error) {
    res.status(400).json({ message: "Access token không đúng" });
  }
}
/* Register account */
async function register(req, res, next) {
  //Validate account before save into database
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const user = await AccountDao.findAccountByUsernameOrEmail(
      req.body.email,
      req.body.username
    );

    const newUser = new Account({
      email: req.body.email,
      username: req.body.username,
      password: hashPassword(req.body.password),
      name: req.body.firstName + " " + req.body.lastName,
      role: process.env.ROLE_USER,
    });

    //If account exist
    if (user) {
      if (!user.isVerify) {
        await AccountDao.deleteAccount(user.email);
      } else {
        if (user.email === newUser.email)
          return res.status(400).json({ message: "Email đã tồn tại" });
        else if (user.username === newUser.username)
          return res.status(400).json({ message: "Tên tài khoản đã tồn tại" });
      }
    }
    const result = await AccountDao.createAccount(newUser);
    sendEmail(createMailCode(result.email, result._id));
    res.status(200).json({ message: result._id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login: login,
  register: register,
  checkLogin: checkLogin,
  verifyAccount: verifyAccount,
  forgotPassword: forgotPassword,
  changePassword: changePassword,
  loginGoogle: loginGoogle,
};
