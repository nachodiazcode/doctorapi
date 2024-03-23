const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

require('./auth');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.use(session({
  secret: 'doctorplus',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope:
      ['email', 'profile'] }
));

app.use('/auth/logout', (req, res) => {
  req.session.destroy();
  res.send("See you again");
})

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/protected',
    failureRedirect: '/auth/google/failure'
  }));

app.get('/auth/google/failure', isLoggedIn, (req, res) => {
  res.send(`<h1>Ocurrió un error</h1>`);
});

app.get('/auth/protected', isLoggedIn, (req, res) => {
  let name = req.user.displayName;
  res.send(`<h1>Hola como estas ${name}</h1> <a href="/auth/logout">logout</a>`);
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});