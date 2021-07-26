//jshint esversion:6
require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (request, response) {
  response.render("home");
});

app.get("/login", function (request, response) {
  response.render("login");
});

app.get("/register", function (request, response) {
  response.render("register");
});

app.post("/register", (request, response) => {
  bcrypt.hash(request.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: request.body.username,
      password: hash,
    });

    newUser.save((err) => {
      if (err) {
        console.log(err);
      } else {
        response.render("secrets");
      }
    });
  });
});

app.post("/login", (request, response) => {
  const userName = request.body.username;
  const password = request.body.password;
  User.findOne({ email: userName }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            response.render("secrets");
          }
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("ahmed is started his server");
});
