const Account = require('../models/account.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendEmail, createMailCode, createMailLink } = require('./send-email');
const AccountDao = require('../dao/account.dao');
const RegisterCodeDao = require('../dao/register-code.dao');
const jwt_decode = require('jwt-decode');
const { OAuth2Client } = require('google-auth-library');
const { createAccount } = require('../dao/account.dao');
const axios = require('axios');

/* Hashing password by SHA256 */
function hashPassword(password) {
  const hash = crypto.createHash('sha256').update(password).digest('base64');
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
      const token = createJWTToken(user._id, user.name, user.avatar);
      const message = {name: user.name, avatar: user.avatar}
      console.log(message)
      res
        .status(200)
        .header(process.env.AUTH_TOKEN, token)
        .json({ token: token, message: message });
    } else {
      res.status(401).json({ message: 'Sai tên tài khoản hoặc mật khẩu' });
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
    return res.status(400).json({ message: 'Email này chưa được đăng ký' });
  }
  sendEmail(createMailLink(result));
  res.status(200).json({ message: 'Link đã được gửi' });
}

/* verify email to register account */
async function verifyAccount(req, res, next) {
  // Get auth header value
  const { verifyCode, accountId } = req.body;
  if (!verifyCode) {
    return res.status(401).json({ message: 'Từ chối truy cập' });
  }
  const result = await RegisterCodeDao.findRegisterCodeByUserId(accountId);
  if (result.length === 0 || result[0].code !== verifyCode) {
    return res.status(400).json({ message: 'Mã xác nhận sai' });
  } else if (result[0].isAlreadyUse) {
    return res.status(400).json({ message: 'Mã xác nhận đã được sử dụng' });
  }
  //check expired code
  const minute = Math.abs(new Date() - result[0].createdDate) / (1000 * 60);
  if (minute > process.env.EXPIRE_MINUTE_REGISTER_CODE) {
    return res.status(400).json({ message: 'Mã xác nhận đã quá hạn' });
  }
  const isVerify = true;
  await AccountDao.updateVerifyAccount(accountId, isVerify);
  await RegisterCodeDao.updateAlreadyUse(result[0]._id);
  res.status(200).json({ message: 'Mã xác nhận đúng' });
}

/* Check login or not */
function checkLogin(req, res, next) {
  const decoded = jwt_decode(req.header(process.env.AUTH_TOKEN));
  const message = {name: decoded.name, avatar: decoded.avatar}
  res.status(200).json({ message: message });
}

/* Change password */
async function changePassword(req, res, next) {
  const { password } = req.body;
  if (!password) {
    return res.status(200).json({ message: 'Token chính xác' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array() });
  }
  try {
    const decoded = jwt_decode(req.header(process.env.RESET_PASSWORD_TOKEN));
    await AccountDao.updatePassword(decoded.accountId, hashPassword(password));
    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
}

/* Create jwt token for login success */
function createJWTToken(id, name, avatar) {
  return jwt.sign({ id: id, name: name, avatar: avatar }, process.env.SECRET_TOKEN, {
    expiresIn: '1h',
  });
}

/* Login with google */
async function loginGoogle(req, res, next) {
  const oAuth2Client = new OAuth2Client();
  const { accessToken, profile } = req.body;
  try {
    const tokenInfo = await oAuth2Client.getTokenInfo(accessToken);
    const { email } = tokenInfo;
    const user = await AccountDao.findAccountByUsernameOrEmail(email, null);
    let token;
    if (!user) {
      const newUser = new Account({
        email: email,
        avatar: profile.imageUrl,
        name: profile.name,
        username: email,
        bio: null,
        company: null,
        location: null,
        dateOfBirth: null,
        website: null,
        github: null,
        password: null,
        isVerify: true,
        role: process.env.ROLE_USER,
      });
      const result = await createAccount(newUser);
      token = createJWTToken(result._id, result.name, profile.imageUrl);
    } else {
      token = createJWTToken(user._id, user.name, profile.imageUrl);
    }
    const message = {name: profile.name, avatar: profile.imageUrl}
    res
      .status(200)
      .header(process.env.AUTH_TOKEN, token)
      .json({ token: token, message: message });
  } catch (error) {
    res.status(400).json({ message: 'Access token không đúng' });
  }
}

/* Login facebook */
async function loginFacebook(req, res, next) {
  const { accessToken, profile } = req.body;
  try {
    const userInfo = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}`
    );
    const user = await AccountDao.findAccountByUsernameOrEmail(profile.email, null);
    let token;
    if (!user) {
      const newUser = new Account({
        email: profile.email,
        avatar: profile.avatar,
        name: userInfo.data.name,
        username: profile.email,
        password: null,
        bio: null,
        company: null,
        location: null,
        dateOfBirth: null,
        website: null,
        github: null,
        isVerify: true,
        role: process.env.ROLE_USER,
      });
      const result = await createAccount(newUser);
      token = createJWTToken(result._id, result.name, profile.avatar );
    } else {
      token = createJWTToken(user._id, user.name, profile.avatar);
    }
    const message = {name: userInfo.data.name, avatar: profile.avatar}
    res
      .status(200)
      .header(process.env.AUTH_TOKEN, token)
      .json({ token: token, message: message });
  } catch (error) {
    res.status(400).json({ message: 'Access token không đúng' });
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
      avatar: '',
      username: req.body.username,
      password: hashPassword(req.body.password),
      name: req.body.firstName + ' ' + req.body.lastName,
      bio: null,
      company: null,
      location: null,
      dateOfBirth: null,
      website: null,
      github: null,
      role: process.env.ROLE_USER,
    });

    //If account exist
    if (user) {
      if (!user.isVerify) {
        await AccountDao.deleteAccount(user.email);
      } else {
        if (user.email === newUser.email)
          return res.status(400).json({ message: 'Email đã tồn tại' });
        else if (user.username === newUser.username)
          return res.status(400).json({ message: 'Tên tài khoản đã tồn tại' });
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
  loginFacebook: loginFacebook,
};
