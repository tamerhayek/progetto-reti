var express = require("express");
var router = express.Router();
require("dotenv").config();

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
                nome : nome,
                cognome: cognome,
                email: email,
                password: password,
                highscore_nolimits: 0,
                highscore_timer: 0
            };
            db.inserisciUtente(utente);
            res.render("signupSuccess", {
                title: "Trivia Stack | Registrazione Effettuata",
                nome: nome,
                cognome: cognome
            });
        });
});

/* GET logout. */
router.get("/logout/", function (req, res, next) {
    res.clearCookie("username");
    res.redirect("/");
});

module.exports = router;
