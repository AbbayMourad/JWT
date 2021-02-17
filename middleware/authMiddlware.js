require('dotenv').config();
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies.jwt;
  // check if jwt exists and it's valid
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } 
      else {
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

module.exports = { requireAuth };