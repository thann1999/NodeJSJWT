const Account = require("../models/account.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const jwt_decode = require("jwt-decode");
const { sendEmail } = require("./send.email");

/* Hashing password by SHA256 */
function hashPassword(password) {
  const hash = crypto.createHash("sha256").update(password).digest("base64");
  return hash;
}

/* Check account is correct or wrong */
function login(req, res, next) {
  //Validate account before query
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  //Query account
  const query = Account.findOne();
  query.where("username").equals(req.body.username);
  query.where("password").equals(hashPassword(req.body.password));
  query.exec((err, user) => {
    if (err) {
      next(err);
    } else {
      if (user !== null) {
        jwt.sign(
          { id: user._id, name: user.name, phone: user.phone },
          process.env.SECRET_TOKEN,
          { expiresIn: "1h" },
          (err, token) => {
            if (err) {
              err.status = 400;
              next(err);
            }
            //send token
            if (!user.activated) {
              res.status(400).json({ message: "Tài khoản chưa kích hoạt" });
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
    }
  });
}

/* Activate account */
function activateAccount(req, res, next) {
  try {
    // Get auth header value
    console.log(req.params.verifyToken);
    const token = req.params.verifyToken;
    const decoded = jwt_decode(token);

    jwt.verify(token, process.env.TRANSPORT_TOKEN);
    Account.updateOne(
      { email: decoded.email },
      { activated: true },
      (err, result) => {
        if (err) {
          err.status = 400;
          next(err);
        }
        res.status(200).json({ message: "Kích hoạt tài khoản thành công" });
      }
    );
  } catch (error) {
    res
      .status(400)
      .send("Mã kích hoạt sai");
  }
}

/* Check login or not */
function checkLogin(req, res, next) {
  const decoded = jwt_decode(req.header("auth-token"));
  res.status(200).json({ message: decoded.name });
}

/* Register account */
function register(req, res, next) {
  //Validate account before save into database
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  //If not errors, save data
  const user = new Account({
    email: req.body.email,
    username: req.body.username,
    password: hashPassword(req.body.password),
    name: req.body.firstName + " " + req.body.lastName,
    phone: req.body.phone,
    dateOfBirth: req.body.dateOfBirth,
    role: process.env.ROLE_USER,
    activated: false,
  });
  const query = Account.findOne();
  query.or([{ email: user.email }, { username: user.username }]);
  query.exec((err, result) => {
    if (err) next(err);
    else {
      //Co result
      if (result) {
        if (result.email === user.email)
          res.status(400).json({ message: "Email đã tồn tại" });
        else if (result.username === user.username)
          res.status(400).json({ message: "Tên tài khoản đã tồn tại" });
      } else {
        user.save((err) => {
          if (err) {
            err.status = 400;
            next(err);
          } else {
            sendEmail(user.email);
            res.status(200).json({ message: "Đăng ký thành công" });
          }
        });
      }
    }
  });
}

module.exports = {
  login: login,
  register: register,
  checkLogin: checkLogin,
  activateAccount: activateAccount,
};
