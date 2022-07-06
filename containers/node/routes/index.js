var express = require("express");
var router = express.Router();

var db = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
    var msg = "";
    if(req.query['msg'] != undefined)
        msg = req.query['msg'];
    if (req.cookies.username) {
        db.getUtente(req.cookies.username)
            .then(function (user) {
                res.render("index", {
                    title: "Trivia Stack",
                    logged: true,
                    messaggio: msg
                });
            })
            .catch(function (err) {
                res.render("index", {
                    title: "Trivia Stack",
                    logged: false,
                    messaggio: msg
                });
            });
    } else {
        res.render("index", {
            title: "Trivia Stack",
            logged: false,
            messaggio: msg
        });
    }
});

module.exports = router;
