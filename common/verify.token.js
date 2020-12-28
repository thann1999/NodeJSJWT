const jwt = require("jsonwebtoken");

//Verify auth token
function auth(req, res, next) {
  // Get auth header value
  const token = req.header("auth-token");
  // Check if token is undefined
  if (!token) {
    return res.status(401).send({ message: "Từ chối truy cập" });
  }
  try {
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ message: "Token không đúng" });
  }
}

//Verify reset password token
function resetPasswordToken(req, res, next) {
  // Get auth header value
  const token = req.header("resetPassword-token");
  // Check if token is undefined
  if (!token) {
    
    return res.status(401).send({ message: "Từ chối truy cập" });
  }
  try {
    jwt.verify(token, process.env.SECRET_TOKEN);
    next();
  } catch (error) {
    res.status(400).send({ message: "Token không đúng" });
  }
}

module.exports = { auth: auth, resetPasswordToken: resetPasswordToken };
