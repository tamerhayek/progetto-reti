var express = require("express");
var router = express.Router();

var db = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
    if (req.cookies.username) {
        db.getUtente(req.cookies.username)
            .then(function (user) {
                res.render("index", {
                    title: "Trivia Stack",
                    logged: true,
                });
            })
            .catch(function (err) {
                res.render("index", {
                    title: "Trivia Stack",
                    logged: false,
                });
            });
    } else {
        res.render("index", {
            title: "Trivia Stack",
            logged: false,
        });
    }
});

module.exports = router;
