const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { render } = require('ejs');

const app = express();


app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());

const users = [];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', (req, res) => {
  let { email, password } = req.body;
  users.push({ email, password });

  const token = createToken(email);
  res.cookie('jwt', token, { httpOnly: true, maxAge: 3*24*60*60*1000 });
  res.end();
});

app.get('/home', (req, resp) => {
  resp.render('home');
});

const port = 8084;
app.listen(port, () => console.log(`listening on port ${port}...`));

const createToken = (email) => {
  return jwt.sign({ email }, 'secret key', {
    expiresIn: 3 * 24 * 60 * 60
  });
};