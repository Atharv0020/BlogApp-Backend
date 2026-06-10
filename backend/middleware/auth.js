const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.userId = decoded.userId;
    req.userName = decoded.userName || 'User';
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};