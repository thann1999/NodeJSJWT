const Account = require("../models/account.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
/* Hashing password by SHA256 */
function hashPassword(password) {
  const hash = crypto.createHash("sha256").update(password).digest("base64");
  return hash;
}

/* Check account is correct or wrong */
function login(req, res, next) {
  const query = Account.findOne();
  query.where("email").equals(req.body.email);
  query.where("password").equals(hashPassword(req.body.password));
  query.exec((err, result) => {
    if (err) {
      next(err);
    } else {
      if (result !== null) {
        const token = jwt.sign(
          { name: result.name, phone: result.phone },
          "jwtnodejs",
          { expiresIn: "1h" },
          (err, token) => {
            if (err) {
              next(err);
            }
            res.json({
              token: token,
            });
          }
        );
      } else {
        res.status(200).json({ message: "Failed" });
      }
    }
  });
}

function postNews(req, res, next) {
  res.json({ message: "Post created..." });
}

/* Register account */
function register(req, res, next) {
  const user = new Account({
    email: req.body.email,
    password: hashPassword(req.body.password),
    name: req.body.name,
    phone: req.body.phone,
    dateOfBirth: req.body.dateOfBirth,
  });

  user.save((err) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ message: "Saved" });
    }
  });
}

//Verify token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== undefined) {
    res.send('ok')
  } else {
    //Forbidden
    res.status(403).send('Forbidden')
  }
}

module.exports = {
  login: login,
  register: register,
  postNews: postNews,
  verifyToken: verifyToken
};
