const jwt = require('jsonwebtoken');

//Verify auth token
function auth(req, res, next) {
  // Get auth header value
  const token =
    req.header(process.env.AUTH_TOKEN) === 'null'
      ? req.header(process.env.RESET_PASSWORD_TOKEN)
      : req.header(process.env.AUTH_TOKEN);
  // Check if token is undefined
  if (!token) {
    return res.status(401).send({ message: 'Không có access token' });
  }
  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res
      .status(403)
      .send({ message: 'Access token không đúng. Hãy thử đăng nhập lại' });
  }
}

module.exports = { auth: auth };
