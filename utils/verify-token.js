const jwt = require('jsonwebtoken');
const {
  RESPONSE_MESSAGE,
  RESPONSE_STATUS,
} = require('./response-message-status.const');
const { HEADERS } = require('../common/constant');

//Verify auth token
function auth(req, res, next) {
  // Get auth header value
  const token =
    req.header(HEADERS.AUTH_TOKEN) === 'null'
      ? req.header(process.env.RESET_PASSWORD_TOKEN)
      : req.header(HEADERS.AUTH_TOKEN);
  // Check if token is undefined
  if (!token) {
    return res
      .status(RESPONSE_STATUS.ERROR)
      .send({ message: RESPONSE_MESSAGE.RESQUEST_WRONG });
  }
  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send({ message: RESPONSE_MESSAGE.WRONG_ACCESS_TOKEN });
  }
}

module.exports = { auth };
