// const jwt = require("jsonwebtoken");

// exports.authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(403).json({ message: "Forbidden" });
//   }
// };

//16/1/25
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Authentication token missing or invalid.' });
//   }

//   const token = authHeader.replace('Bearer ', '');
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual secret key
//     const user = await User.findById(decoded.id); // Use the ID stored in the token payload
//     if (!user) {
//       return res.status(401).json({ error: 'User not found.' });
//     }

//     req.user = user; // Attach user to request object
//     next();
//   } catch (err) {
//     res.status(401).json({ error: 'Please authenticate.' });
//   }
// };

// module.exports = authMiddleware;




const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token missing or invalid.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret'); // Replace with your actual secret key

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Attach user to request object
    req.user = user;

    // Check for admin role if required
    if (req.route.path.startsWith('/admin') && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token. Please authenticate.' });
  }
};

module.exports = authMiddleware;
