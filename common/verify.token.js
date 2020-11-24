const jwt = require("jsonwebtoken");

//Verify token
function auth(req, res, next) {
  // Get auth header value
  const token = req.header("auth-token");
  // Check if token is undefined
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const verified = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verified;
    next()
  } catch (error) {
      res.status(400).send('Invalid token')
  }
}

module.exports = {auth: auth}