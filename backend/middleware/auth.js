const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.userId = decoded.userId;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    req.userName = user.name;
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};