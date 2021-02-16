const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { render } = require('ejs');
const { json } = require('express');

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(cookieParser());

// we will store users here instead of a database
const users = [
  {
    email: "a@gmail.com",
    password: "aze123"
  }
];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // get email & password
  let { email, password } = req.body;
  // hash the password
  //password = bcrypt.hashSync(password, bcrypt.genSaltSync());
  // add the user to the table: users
  let emailUsed = users.some(u => u.email === email);
  if (!emailUsed) {
    users.push({ email, password });
    const token = createToken(email);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.send({});
  } else {
    res.send({error: "email already in use"});
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  let user = users.find(u => u.email === email);
  if (user != null /*&& bcrypt.compareSync(password, user.password)*/) {
    console.log("-----you are a user-------");
    const token = createToken(user.email);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.send({});
  } else {
    res.send({ error: 'invalid email and/or password' });
    console.log('-------not a user-------');
  }
});

app.get('/home', (req, resp) => {
  resp.render('home');
  console.log(users);
});

const port = 8084;
app.listen(port, () => console.log(`listening on port ${port}...`));


const createToken = (email) => {
  return jwt.sign({ email }, 'secret key', {
    expiresIn: 3 * 24 * 60 * 60
  });
};
