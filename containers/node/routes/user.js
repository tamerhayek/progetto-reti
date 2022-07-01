var express = require("express");
var router = express.Router();
require("dotenv").config();

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const session = require('express-session');
router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());


var db = require("../db");

/* GET user page. */
router.get("/", function (req, res, next) {
  const logged = req.cookies.username ? true : false;
  if (req.query && req.query.username) {
    db.getUtente(req.query.username)
      .then(function (user) {
        res.render("user", {
          title: "Trivia Stack | " + req.query.username,
          user: user,
          logged: logged,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render("user", {
          title: "Trivia Stack | Utente non trovato",
          user: 0,
          logged: logged,
        });
      });
  } else if (req.cookies.username) {
    db.getUtente(req.cookies.username)
      .then(function (user) {
        res.render("user", {
          title: "Trivia Stack | " + req.cookies.username,
          user: user,
          logged: logged,
        });
      })
      .catch(function (err) {
        console.error(err);
        res.render("user", {
          title: "Trivia Stack | Utente non trovato",
          user: 0,
          logged: logged,
        });
      });
  } else {
    res.redirect("/user/login");
  }
});

/* GET login. */
router.get("/login/", function (req, res, next) {
  if (req.cookies.username) {
    db.getUtente(req.cookies.username)
      .then(function (user) {
        res.redirect("/");
      })
      .catch(function (err) {
        console.error(err);
        res.render("login", {
          title: "Trivia Stack | Login",
        });
      });
  } else {
    res.render("login", {
      title: "Trivia Stack | Login",
    });
  }
});

/* POST login. */
router.post("/login/", function (req, res, next) {
  db.getUtente(req.body.username)
    .then(function (user) {
      // controlla password
      res.cookie("username", user._id);
      res.redirect("/");
    })
    .catch(function (err) {
      console.error(err);
      res.render("login", {
        title: "Trivia Stack | Login",
        notRegistered: true,
      });
    });
});

/* GET signup. */
router.get("/signup/", function (req, res, next) {
  res.render("signup", {
    title: "Trivia Stack | Signup",
  });
});

/* POST signup. */
router.post("/signup/", function (req, res, next) {
  const { nome, cognome, username, email, password } = req.body;
  db.getUtente(username)
    .then(function (user) {
      res.render("signup", {
        title: "Trivia Stack | Registrazione",
        registered: true,
      });
    })
    .catch(function (err) {
      var utente = {
        _id: username,
        nome: nome,
        cognome: cognome,
        email: email,
        password: password,
        highscore_nolimits: 0,
        highscore_timer: 0,
      };
      db.inserisciUtente(utente);
      res.render("signupSuccess", {
        title: "Trivia Stack | Registrazione Effettuata",
        nome: nome,
        cognome: cognome,
      });
    });
});

/* GET logout. */
router.get("/logout/", function (req, res, next) {
  res.clearCookie("username");
  res.redirect("/");
});

// Richiesta login GOOGLE (OAuth)

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/user/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log("ID: " + profile.id);
      console.log("Name: " + profile.displayName);
      console.log("Email : " + profile.emails[0].value);
      console.log(profile);

      // controlla se l'utente esiste nel database, altrimenti lo inserisce
      db.getUtente(profile.displayName.replaceAll(" ", ""))
        .then(function (user) {
            console.log("utente già inserito nel db");
        })
        .catch(function (err) {
          var utente = {
            _id: profile.displayName.replaceAll(" ", ""),
            nome: profile._json.given_name,
            cognome: profile._json.family_name,
            email: profile._json.email,
            logged_with: 'google',
            highscore_nolimits: 0,
            highscore_timer: 0,
          };
          db.inserisciUtente(utente);
        });

      return done(null, profile);
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/user/auth/google/success/",
    failureRedirect: "/user/auth/google/failure/",
  }),
  function (req, res, next) {
    res.send("Ciao");
  }
);

/* GET oAuth success. */
router.get("/auth/google/success/", isLoggedIn, function (req, res, next) {
  console.log("sto stampando le informazioni");
  console.log(req.user.displayName);
  res.cookie("username", req.user.displayName);

  //res.cookie("username", 'mariadianacalugaru');
  console.log( "sto stampando il cookie ......................." + req.cookies.username);
  res.redirect("/");
});

module.exports = router;
