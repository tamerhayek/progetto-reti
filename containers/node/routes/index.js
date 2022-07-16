var express = require("express");
const { callbackify } = require("util");
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

router.get("/api/classifica/", function (req, res, next) {
    db.query("select id as posizione, nome, cognome, username, punteggio from users where punteggio > 0 order by punteggio desc")
        .then(function (result) {
            var classifica = result.rows;
            for(var i = 0; i < result.rowCount; i++)
                classifica[i].posizione = i+1;
            
            console.log(classifica);
            res.send(classifica);
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: "+ err.stack);
        })
});

router.get("/api/classifica/:count", function (req, res, next) {
    var count = req.params.count;
    db.query("select id as posizione, nome, cognome, username, punteggio from users where punteggio > 0 order by punteggio desc limit $1", [count,])
        .then(function (result) {
            var classifica = result.rows;
            for(var i = 0; i < result.rowCount; i++)
                classifica[i].posizione = i+1;
            
            console.log(classifica);
            res.send(classifica);
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: "+ err.stack);
        })
});

router.get("/api/statisticheCategorie", function (req, res, next) {
    db.query("select id as posizione, nome, rating from statistichecategorie order by rating")
        .then(function (result) {
            for(var i = 0; i < result.rowCount; i++)
                result.rows[i].posizione = i+1;
            res.send(result.rows);
        })
        .catch(function (err) {
            console.log(err.stack);
            res.send("DB Error: "+ err.stack);
        })
});

module.exports = router;
