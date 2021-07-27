//jshint esversion:6
//require("dotenv").config();
//const express = require("express");
//const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
///
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

//// local login setraticy
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.post("/login", (request, response) => {
  const user = new User({
    username: request.body.username,
    password: request.body.password,
  });
  request.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(request, response, function () {
        response.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, function () {
  console.log("ahmed is started his server");
});
