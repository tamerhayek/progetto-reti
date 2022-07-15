var express = require("express");
var router = express.Router();
const amqplib = require("amqplib/callback_api");
const crypto = require("crypto");
require("dotenv").config();

const admins = ["tamerhayek", "dianacalugaru", "samuelecervo"];

var db = require("../db");

var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

router.use(passport.initialize());
router.use(passport.session());
var cookieParser = require("cookie-parser");
router.use(cookieParser());

/* GET user page. */
router.get("/", function (req, res, next) {
    var logged = false;
    if (req.cookies.username) {
        db.query("select * from users where username = $1", [
            req.cookies.username,
        ])
            .then(function (result) {
                if (result.rowCount == 1) logged = true;
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    }
    if (req.query.username) {
        db.query("select * from users where username = $1", [
            req.query.username,
        ])
            .then(function (result) {
                res.render("user", {
                    title: "Trivia Stack | " + req.query.username,
                    user: result.rows[0],
                    logged: logged,
                });
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    } else if (req.cookies.username) {
        db.query("select * from users where username = $1", [
            req.cookies.username,
        ])
            .then(function (result) {
                res.render("user", {
                    title: "Trivia Stack | " + req.cookies.username,
                    user: result.rows[0],
                    logged: logged,
                });
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    } else {
        res.redirect("/user/login");
    }
});

/* ALL */
router.get("/all", function (req, res, next) {
    if (req.cookies.username && admins.includes(req.cookies.username)) {
        db.query("select * from users")
            .then(function (result) {
                res.render("database", {
                    title: "Trivia Stack | ALL",
                    users: result.rows,
                    logged: true,
                });
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    } else {
        res.redirect("/");
    }
});

/* GET login. */
router.get("/login/", function (req, res, next) {
    if (req.cookies.username) {
        db.query("select * from users where username = $1", [
            req.cookies.username,
        ])
            .then(function (result) {
                if (result.rowCount == 1) res.redirect("/");
                else {
                    res.render("login", {
                        title: "Trivia Stack | Login",
                    });
                }
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    } else {
        res.render("login", {
            title: "Trivia Stack | Login",
        });
    }
});

/* POST login. */
router.post("/login/", function (req, res, next) {
    db.query("select * from users where username = $1", [req.body.username])
        .then(function (result) {
            if (result.rowCount == 1) {
                var passwordHashed = crypto
                    .createHash("md5")
                    .update(req.body.password)
                    .digest("hex");
                if (result.rows[0].password == passwordHashed) {
                    res.cookie("username", result.rows[0].username);
                    res.redirect("/");
                } else {
                    res.render("login", {
                        title: "Trivia Stack | Login",
                        notCorrect: true,
                    });
                }
            } else {
                res.render("login", {
                    title: "Trivia Stack | Login",
                    notRegistered: true,
                });
            }
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: " + err.stack);
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
    db.query("select * from users where username = $1", [username])
        .then(function (result) {
            if (result.rowCount == 1) {
                res.render("signup", {
                    title: "Trivia Stack | Registrazione",
                    registered: true,
                });
            } else {
                var passwordHashed = crypto
                    .createHash("md5")
                    .update(password)
                    .digest("hex");
                var query = `INSERT INTO users 
                (nome, cognome, username, email, password, punteggio) VALUES 
                ('${nome}', '${cognome}', '${username}', '${email}', '${passwordHashed}',  0)`;
                db.query(query)
                    .then(function (result) {
                        console.log(result);
                        res.render("signupSuccess", {
                            title: "Trivia Stack | Registrazione Effettuata",
                            nome: nome,
                            cognome: cognome,
                        });
                    })
                    .catch(function (err) {
                        console.log(err.stack);
                        res.send("DB Error: " + err.stack);
                    });
            }
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: " + err.stack);
        });
    /*amqplib.connect("amqp://guest:guest@rabbitmq", (err, connection) => {
        if (err) {
            console.error(err.stack);
        }
        connection.createChannel((err, channel) => {
            if (err) {
                console.error(err.stack);
            }
            var queue = "queue";
            channel.assertQueue(
                queue,
                {
                    durable: true,
                },
                (err) => {
                    if (err) {
                        console.error(err.stack);
                    }
                    let sender = (content) => {
                        let sent = channel.sendToQueue(
                            queue,
                            Buffer.from(JSON.stringify(content)),
                            {
                                persistent: true,
                                contentType: "application/json",
                            }
                        );
                    };

                    let sent = 0;
                    let sendNext = () => {
                        if (sent >= 1) {
                            console.log("All messages sent!");
                            return channel.close(() => connection.close());
                        }
                        sent++;
                        sender({
                            email: email,
                            username: username,
                        });
                        return channel.close(() => connection.close());
                    };
                    sendNext();
                }
            );
        });
    });*/
});

/* GET logout. */
router.get("/logout/", function (req, res, next) {
    res.clearCookie("username");
    res.redirect("/");
});

router.get("/success", (req, res) => res.redirect("/"));
router.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:80/user/auth/google/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            db.query("select * from users where username = $1", [
                profile.displayName.toLowerCase().replaceAll(" ", "."),
            ])
                .then(function (result) {
                    if (result.rowCount == 1) {
                        console.log("utente già inserito nel db");
                        return done(null, profile);
                    } else {
                        var query = `INSERT INTO users 
                          (nome, cognome, username, email, password, logged_with, access_token, refresh_token, punteggio) VALUES 
                          ('${profile._json.given_name}', '${
                            profile._json.family_name
                        }',
                            '${profile.displayName
                                .toLowerCase()
                                .replaceAll(" ", ".")}', '${
                            profile._json.email
                        }', '', 'google',
                        '${accessToken}', '${refreshToken}',
                        0)`;
                        db.query(query)
                            .then(function (result) {
                                console.log(result);
                                return done(null, profile);
                            })
                            .catch(function (err) {
                                console.log(err.stack);
                                return done(null);
                            });
                    }
                })
                .catch(function (err) {
                    console.log(err.stack);
                    return done(null);
                });
            /*
            amqplib.connect(
                "amqp://guest:guest@rabbitmq",
                (err, connection) => {
                    if (err) {
                        console.error(err.stack);
                    }
                    connection.createChannel((err, channel) => {
                        if (err) {
                            console.error(err.stack);
                        }
                        var queue = "queue";
                        channel.assertQueue(
                            queue,
                            {
                                durable: true,
                            },
                            (err) => {
                                if (err) {
                                    console.error(err.stack);
                                }
                                let sender = (content) => {
                                    let sent = channel.sendToQueue(
                                        queue,
                                        Buffer.from(JSON.stringify(content)),
                                        {
                                            persistent: true,
                                            contentType: "application/json",
                                        }
                                    );
                                };

                                let sent = 0;
                                let sendNext = () => {
                                    if (sent >= 1) {
                                        console.log("All messages sent!");
                                        return channel.close(() =>
                                            connection.close()
                                        );
                                    }
                                    sent++;
                                    sender({
                                        email: profile._json.email,
                                        username: profile.displayName
                                            .toLowerCase()
                                            .replaceAll(" ", "."),
                                    });
                                    return channel.close(() =>
                                        connection.close()
                                    );
                                };
                                sendNext();
                            }
                        );
                    });
                }
            );
            */
            return done(null, profile);
        }
    )
);

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
        accessType: "offline",
        prompt: "consent",
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/user/error" }),
    function (req, res) {
        res.cookie(
            "username",
            req.user.displayName.toLowerCase().replaceAll(" ", ".")
        );

        res.redirect("/user/success");
    }
);

module.exports = router;
