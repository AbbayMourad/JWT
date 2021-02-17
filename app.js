require('dotenv').config()
const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { render } = require('ejs');
const { json } = require('express');
const { requireAuth } = require('./middleware/authMiddlware');

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());

// we will store users here instead of a database
const users = [];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // get email & password
  let { email, password } = req.body;
  // check if email is already taken 
  let emailUsed = users.some(u => u.email === email);
  if (!emailUsed) {
    // hash the password
    password = bcrypt.hashSync(password, bcrypt.genSaltSync());
    users.push({ email, password });
    const token = createToken(email);
    res.cookie('jwt', token, { httpOnly: true, maxAge: parseInt(process.env.COOKIE_MAX_AGE) });
    res.send({});
  } else {
    res.send({ error: "email already in use" });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user = users.find(u => u.email === email);
  if (user != null && bcrypt.compareSync(password, user.password)) {
    // get token and store it in a cookie
    const token = createToken(user.email);
    res.cookie('jwt', token, { httpOnly: true, maxAge: parseInt(process.env.COOKIE_MAX_AGE) });
    res.send({});
  } else {
    res.send({ error: 'invalid email and/or password' });
  }
});

// home is a protected route
app.get('/home', requireAuth, (req, resp) => {
  // to get the email of the current user
  function getEmail() {
    const token = req.cookies.jwt;
    return jwt.verify(token, 'secret key', (err, decodedToken) => decodedToken.email);
  }
  resp.locals.email = getEmail();
  resp.render('home');
});

app.get('/logout', (req, res) => {
  // override jwt and give it a short life (1 ms), so basically it's deleted
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
});

const createToken = (email) => {
  return jwt.sign({ email }, process.env.SECRET_KEY, {
    expiresIn: parseInt(process.env.JWT_MAX_AGE)
  });
};

// for test 
app.get('/users', (req, res) => {
  res.send(users);
});

const port = process.env.PORT || 8089;
app.listen(port, () => console.log(`listening on port ${port}...`));




