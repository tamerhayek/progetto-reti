var express = require("express");
var router = express.Router();
const amqplib = require('amqplib/callback_api');
require("dotenv").config();

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

const session = require('express-session');
router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());
var cookieParser = require('cookie-parser');
router.use(cookieParser());

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
    amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
    		if (err) {
        		console.error(err.stack);
    		}
    		connection.createChannel((err, channel) => {
        		if (err) {
            			console.error(err.stack);
        		}
			var queue = 'queue';
      			channel.assertQueue(queue, {
            		durable: true
        		}, err => {
            		if (err) {
              			console.error(err.stack);
      				  }
            		let sender = (content) => {
                		let sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {
                    		persistent: true,
                    		contentType: 'application/json'
                		});
            		};

            		let sent = 0;
            		let sendNext = () => {
               	 	if (sent >= 1) {
                    			console.log('All messages sent!');
                    			return channel.close(() => connection.close());
                		}
                		sent++;
                		sender({
                    			email: email, username: username
                    		});
                    		return channel.close(() => connection.close());
            		};
            		sendNext();
        		});
    		});
	});
});

/* GET logout. */
router.get("/logout/", function (req, res, next) {
  res.clearCookie("username");
  res.redirect("/");
});

router.get('/success', (req, res) => res.redirect("/"));
router.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:80/user/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      db.getUtente(profile.displayName.toLowerCase().replaceAll(" ", "."))
        .then(function (user) {
            console.log("utente già inserito nel db");
        })
        .catch(function (err) {
          var utente = {
            _id: profile.displayName.toLowerCase().replaceAll(" ", "."),
            nome: profile._json.given_name,
            cognome: profile._json.family_name,
            email: profile._json.email,
            logged_with: 'google',
            highscore_nolimits: 0,
            highscore_timer: 0,
          };
          db.inserisciUtente(utente);
        });
        amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
          if (err) {
              console.error(err.stack);
          }
          connection.createChannel((err, channel) => {
              if (err) {
                    console.error(err.stack);
              }
          var queue = 'queue';
                channel.assertQueue(queue, {
                    durable: true
                }, err => {
                    if (err) {
                        console.error(err.stack);
                    }
                    let sender = (content) => {
                        let sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {
                            persistent: true,
                            contentType: 'application/json'
                        });
                    };

                    let sent = 0;
                    let sendNext = () => {
                      if (sent >= 1) {
                              console.log('All messages sent!');
                              return channel.close(() => connection.close());
                        }
                        sent++;
                        sender({
                              email: profile._json.email, username: profile.displayName.toLowerCase().replaceAll(" ", ".")
                            });
                            return channel.close(() => connection.close());
                    };
                    sendNext();
                });
            });
        });
      return done(null, profile);
  }
));
 
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/user/error' }),
  function(req, res) {
    // Successful authentication, redirect success.

    res.cookie("username", req.user.displayName.toLowerCase().replaceAll(" ","."));
    
    res.redirect('/user/success');
  });

module.exports = router;
