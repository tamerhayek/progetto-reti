var express = require("express");
var router = express.Router();
require("dotenv").config();

// couch db
const NodeCouchDb = require("node-couchdb");
// node-couchdb instance with default options
const couch = new NodeCouchDb({
    auth: {
        user: process.env.COUCHDB_USR,
        pass: process.env.COUCHDB_PSW,
    },
});

/* EXAMPLE QUERY
	{
		"selector": {
			"status": { "$eq": "draft" }
		},
		"fields": ["_id", "_rev", "title", "content", "date", "author"],
		"sort": [],
		"limit": 10,
		"skip": 0,
		"execution_stats": true
	}
*/

const dbName = "users";
const parameters = {};

/* GET user page. */
router.get("/", function (req, res, next) {
    //res.cookie(`username`,`tamerhayek`);
    if (req.query && req.query.username) {
        const mangoQuery = {
            selector: {
                username: { $eq: req.query.username },
            },
            fields: [
                "nome",
                "cognome",
                "username",
                "highscore_nolimits",
                "highscore_timer",
            ],
            sort: [],
            limit: 1,
            skip: 0,
            execution_stats: true,
        };
        couch.mango(dbName, mangoQuery, parameters).then(
            ({ data, headers, status }) => {
                if (status == 200 && data.docs.length) {
                    res.render("user", {
                        title: "Titolo | " + req.query.username,
                        user: data.docs[0],
                    });
                } else {
                    res.render("user", {
                        title: "Titolo | Utente non trovato",
                        user: 0,
                    });
                }
            },
            (err) => {
                console.log(err);
                res.redirect("/");
            }
        );
    } else {
        if (req.cookies.username) {
            const mangoQuery = {
                selector: {
                    username: { $eq: req.cookies.username },
                },
                fields: [
                    "nome",
                    "cognome",
                    "username",
                    "email",
                    "highscore_nolimits",
                    "highscore_timer",
                ],
                sort: [],
                limit: 1,
                skip: 0,
                execution_stats: true,
            };
            couch.mango(dbName, mangoQuery, parameters).then(
                ({ data, headers, status }) => {
                    if (status == 200 && data.docs.length) {
                        console.log(data.docs);
                        res.render("user", {
                            title: "Titolo | " + req.cookies.username,
                            user: data.docs[0],
                        });
                    } else {
                        res.render("user", {
                            title: "Titolo | Utente non trovato",
                            user: 0,
                        });
                    }
                },
                (err) => {
                    console.log(err);
                    res.redirect("/");
                }
            );
        } else {
            res.redirect("/user/login");
        }
    }
});

/* GET login. */
router.get("/login/", function (req, res, next) {
    res.render("login", {
        title: "Titolo | Login",
    });
});

/* POST login. */
router.post("/login/", function (req, res, next) {
    /*const mangoQuery = {
        selector: {
            username: { $eq: req.body.username },
            password: { $eq: req.body.password }
        },
        fields: [
            "username",
            "password"
        ],
        sort: [],
        limit: 1,
        skip: 0,
        execution_stats: true,
    };
    couch.mango(dbName, mangoQuery, parameters).then(
        ({ data, headers, status }) => {
            if (status == 200 && data.docs.length) {
                console.log(data.docs);
                res.render("user", {
                    title: "Titolo | " + req.cookies.username,
                    user: data.docs[0],
                });
                res.cookie("username", req.body.username);
                res.cookie("password", req.body.password);
            } else {
                res.render("user", {
                    title: "Titolo | Utente non trovato",
                    user: 0,
                });
            }
        },
        (err) => {
            console.log(err);
            res.redirect("/");
        }
    );*/
    res.send("Utente " + req.body.username);
});

/* GET home page. */
router.get("/signup/", function (req, res, next) {
    res.render("signup", {
        title: "Titolo | Signup",
    });
});

/* POST home page. */
router.post("/signup/", function (req, res, next) {
    res.send("Utente " + req.body.username);
});

module.exports = router;
