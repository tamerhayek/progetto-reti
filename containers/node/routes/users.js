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
                    res.render("users", {
                        title: "Titolo | " + req.query.username,
                        user: data.docs[0],
                    });
                } else {
                    res.render("users", {
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
                        res.render("users", {
                            title: "Titolo | " + req.cookies.username,
                            user: data.docs[0],
                        });
                    } else {
                        res.render("users", {
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
            res.redirect("/users/login");
        }
    }
});

/* GET login. */
router.get("/login/", function (req, res, next) {
    res.render("login", {
        title: "Titolo | Login",
    });
});

/* GET home page. */
router.get("/signup/", function (req, res, next) {
    res.render("signup", {
        title: "Titolo | Signup",
    });
});

module.exports = router;
