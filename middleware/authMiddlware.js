const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.cookies.jwt;

  // check if jwt exists and it's valid
  if (token) {
    jwt.verify(token, 'secret key', (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        //console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/login');
  }
};

module.exports = { requireAuth };