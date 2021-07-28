//jshint esversion:6
//require("dotenv").config();

const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

///
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
//// set up the session
app.use(
  session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
  })
);
/// initaliz the passpoert
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

//// local login setraticy
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", function (request, response) {
  response.render("home");
});

app.get("/login", function (request, response) {
  response.render("login");
});

app.get("/register", function (request, response) {
  response.render("register");
});

app.get("/secrets", function (request, response) {
  if (request.isAuthenticated()) {
    response.render("secrets");
  } else {
    response.redirect("/login");
  }
});

app.get("/logout", function (request, response) {
  request.logOut();
  response.redirect("/");
});
app.post("/register", (request, response) => {
  User.register(
    { username: request.body.username },
    request.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        response.redirect("/register");
      } else {
        passport.authenticate("local")(request, response, function () {
          response.redirect("/secrets");
        });
      }
    }
  );
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.post("/login", (request, response) => {
  response.render("login");
});

app.listen(3000, function () {
  console.log("ahmed is started his server");
});
