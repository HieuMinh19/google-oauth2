const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// define ClientID and ClientSecret
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = 'YOUR_GOOGLE_CLIENT_SECRET';

const app = express();

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Define serializeUser and deserializeUser
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  return done(null, id);
});

// Google OAuth2 Configuration
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("access_token", accessToken);
    console.log("=== PROFILE", profile);
    // Save user information to database....
    return done(null, profile);
  }
));

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>');
});

// navigate to login page
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// callback handle when login success
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log("callback after login success")

    // save User login session and redirect to user-info page
    req.session.user = req.user;
    res.redirect('/user-info');
  }
);

app.get('/user-info', function(req, res) {
  if (req.isAuthenticated()) {
    res.send('Hello ' + req.session.user.displayName + '!');
  } else {
    res.send('Not authenticated');
  }
});

// Define a route to delete a session
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
