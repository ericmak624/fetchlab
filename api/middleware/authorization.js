const jwt = require('jsonwebtoken');
const config = require('config');

const secret = config.jwt.secret || process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.sendStatus(401);
  }

  try {
    const [type, token] = req.headers.authorization.split(' ');
    jwt.verify(token, secret);
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};