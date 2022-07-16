var express = require("express");
var router = express.Router();
var db = require("../db");

router.get("/classifica", function (req, res, next) {
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

router.get("/classifica/:count", function (req, res, next) {
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

router.get("/statisticheCategorie", function (req, res, next) {
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