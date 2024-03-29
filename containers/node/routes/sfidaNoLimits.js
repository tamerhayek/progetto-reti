var express = require("express");
var router = express.Router();
var request = require("request");
const crypto = require("crypto");
require("dotenv").config();

var db = require("../db");
var calendar = require("../calendar");

var googleTranslate = require("google-translate")(process.env.GOOGLE_API_KEY);

var optionsVOICE = {
    method: "POST",
    url: "https://voicerss-text-to-speech.p.rapidapi.com/",
    qs: { key: process.env.VOICE_RSS_KEY },
    headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": "3a280afaa7mshbfb05807eb47cb9p1f0696jsnadcd57690913",
        "X-RapidAPI-Host": "voicerss-text-to-speech.p.rapidapi.com",
        useQueryString: true,
    },
    form: {
        f: "8khz_8bit_mono",
        c: "mp3",
        r: "0",
        hl: "it-it",
        src: "",
        b64: "true",
    },
};

// GET
router.get("/", function (req, res, next) {
    if (req.cookies["username"] == undefined) res.redirect("user/login");
    const url =
        "https://the-trivia-api.com/api/questions?categories=" +
        req.query["cat"].split(" ").join("_").replaceAll("_e_", "_&_") +
        "&limit=1&difficulty=" +
        req.query["diff"];
    request(url, function (error, responseQuizAPI, bodyTriviaAPI) {
        if (!error && responseQuizAPI.statusCode == 200) {
            const json = JSON.parse(bodyTriviaAPI);

            var punteggio = req.cookies["punteggio"];
            
            console.log("\n\n\nAPI: "+JSON.stringify(json)+"\n\n\n");

            //inizializzazione partita
            if (
                req.cookies["correct"] === undefined ||
                req.cookies["isFinished"] == "false"
            ) {
                //inizializzazione counter punteggio
                res.cookie("punteggio", "0");
                punteggio = 0;
                res.cookie("startTime", JSON.stringify(new Date()));
            }

            var domanda = json[0].question;
            var incorrectAnswers = json[0].incorrectAnswers;
            var correctAnswer = json[0].correctAnswer;

            res.cookie("isFinished", false);

            var daTradurre = [
                domanda, //POS_0 = DOMANDA
                correctAnswer,
            ]; //POS_1 = RISPOSTA CORRETTA
            for (var x in incorrectAnswers)
                daTradurre.push(incorrectAnswers[x]); //POS >= 2 RISPOSTE SBAGLIATE
            
            console.log("\n\n\nDOMANDE: "+daTradurre+"\n\n\n");
            //traduzione e rendering della pagina
            googleTranslate.translate(
                daTradurre.toString().replaceAll(",","-"),
                "it",
                function (err, translation) {
                    if (!err) {
                        console.log("\n\n\nTRADUZIONE ORIGINALE: "+translation.translatedText+"\n\n\n");

                        var traduzione = translation.translatedText.split("-");
                        console.log("\n\n\nTRADUZIONE: "+traduzione+"\n\n\n");

                        var allanswers = traduzione.slice(2);
                        allanswers.push(traduzione[1]);

                        var randomIndex;
                        for (var i = allanswers.length; i > 0; ) {
                            // Pick a remaining element.
                            randomIndex = Math.floor(Math.random() * i);
                            i--;
                            // And swap it with the current element.
                            [allanswers[i], allanswers[randomIndex]] = [
                                allanswers[randomIndex],
                                allanswers[i],
                            ];
                        }

                        var hash = crypto
                            .createHash("md5")
                            .update(traduzione[1])
                            .digest("hex");

                        res.cookie("correct", hash);

                        optionsVOICE.form.src = traduzione[0];
                        optionsVOICE.form.hl = "it-it";
                        request(
                            optionsVOICE,
                            function (error, response, domandaIT) {
                                if (error) domandaIT = "-1";
                                if (
                                    domandaIT ==
                                    "ERROR: The API key is not specified!"
                                )
                                    domandaIT = "-1";
                                optionsVOICE.form.src = daTradurre[0];
                                optionsVOICE.form.hl = "en-us";
                                request(
                                    optionsVOICE,
                                    function (error, response, domandaEN) {
                                        if (error) domandaEN = "-1";
                                        if (
                                            domandaEN ==
                                            "ERROR: The API key is not specified!"
                                        )
                                            domandaEN = "-1";
                                        res.render("sfidaNoLimits", {
                                            title: "SFIDA NO LIMITS",
                                            punteggio: punteggio,
                                            domanda: traduzione[0],
                                            risposte: allanswers,
                                            audioDomandaIT: domandaIT,
                                            audioDomandaEN: domandaEN,
                                        });
                                    }
                                );
                            }
                        );
                    } else {
                        res.clearCookie("punteggio");
                        res.clearCookie("correct");

                        res.redirect(
                            "/?msg=Impossibile+giocare+adesso,+riprova+più+tardi!"
                        );
                    }
                }
            );
        } else {
            res.clearCookie("punteggio");
            res.clearCookie("correct");

            res.redirect(
                "/?msg=Impossibile+giocare+adesso,+riprova+più+tardi!"
            );
        }
    });
});

//POST

router.post("/", function (req, res, next) {
    var utente = req.cookies["username"];
    var risposta = req.body.risposta;
    var hashedrisposta = crypto
        .createHash("md5")
        .update(risposta)
        .digest("hex");
    var correctAnswer = req.cookies["correct"];

    res.cookie("isFinished", true);

    if (correctAnswer == hashedrisposta) {
        var x = parseInt(req.cookies["punteggio"]);
        x++;
        res.cookie("punteggio", x);
        res.redirect(
            "/sfidaNoLimits?cat=" +
                req.query["cat"]
                    .toString()
                    .split(" ")
                    .join("+")
                    .replaceAll("+&+", "+e+") +
                "&diff=" +
                req.query["diff"]
        );
    } else {
        var punteggio = parseInt(req.cookies["punteggio"]);
        res.clearCookie("correct");
        res.clearCookie("punteggio");
        var msg = "";
        db.query(`select * from users where username = '${utente}'`)
            .then(function (result) {
                if (result.rowCount == 1) {
                    var record = false;
                    if (parseInt(result.rows[0].punteggio) < punteggio) {
                        record = true;
                        db.query(
                            "update users set punteggio = $1 where username = $2",
                            [punteggio, utente]
                        ).catch(function (err) {
                            console.log(err.stack);
                            res.send("DB Error: " + err.stack);
                        });
                    }
                    if (result.rows[0].logged_with == "google") {
                        const startTime = JSON.parse(req.cookies.startTime);
                        const endTime = new Date();
                        calendar.newEvent(
                            req.cookies.refreshToken,
                            startTime,
                            endTime,
                            "Partita TriviaStack",
                            "Hai risposto correttamente  a " +
                                punteggio +
                                " domande!"
                        );
                    } else {
                        msg =
                            "Per tenere traccia delle tue partite crea un account con google!";
                    }
                    res.render("risultati", {
                        title: "Trivia Stack | Risultati",
                        punteggio: punteggio,
                        utente: utente,
                        record: record,
                        msg: msg,
                        logged: true,
                    });
                } else {
                    res.send("ERRORE: utente non trovato!");
                }
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
        res.clearCookie("startTime");
    }
});

module.exports = router;
