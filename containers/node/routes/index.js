var express = require("express");
var router = express.Router();

var db = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
    var msg = req.query.msg ? req.query.msg : false;
    var logged = false;
    if (req.cookies.username) {
        db.query("select * from users where username = $1", [req.cookies.username])
        .then(function (result) {
            if (result.rowCount == 1) logged = true;
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: "+ err.stack);
        })
    }
    
    db.query("select * from users where punteggio > 0 order by punteggio desc limit 3")
        .then(function (result) {
            res.render("index", {
                title: "Trivia Stack",
                logged: logged,
                classifica: result.rows,
                msg: msg
            });
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: "+ err.stack);
        })

});

module.exports = router;
