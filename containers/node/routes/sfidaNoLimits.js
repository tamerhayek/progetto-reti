var express = require('express');
var router = express.Router();
var request = require('request');
const crypto = require('crypto');
require('dotenv').config();

var db = require('../db');
const { rmSync } = require('fs');

var googleTranslate = require('google-translate')(process.env.GOOGLE_API_KEY);

// GET
router.get('/', function(req, res, next) {
    const url = "https://the-trivia-api.com/api/questions?categories="
                + req.query['cat'].split(' ').join('_').replaceAll('_e_', '_&_') + "&limit=1&difficulty=" + req.query['diff'];
    request(url, function(error, responseQuizAPI, bodyTriviaAPI) {
            if (!error && responseQuizAPI.statusCode == 200) {
                const json = JSON.parse(bodyTriviaAPI);

                var punteggio =  req.cookies['punteggio'];

                if(req.cookies['correct']===undefined || req.cookies['isFinished'] == '"false"'){     //inizializzazione counter punteggio
                    console.log("-------------------------------------\n\n\n\n\n\n\n\n\n Setto il problema a 0");
                    res.cookie('punteggio', '0');   
                    punteggio = 0;        
                }

                var id_domanda = json[0].id;
                var domanda = json[0].question;
                var incorrectAnswers = json[0].incorrectAnswers;
                var correctAnswer = json[0].correctAnswer;
                
                res.cookie('isFinished', false);
                

                var daTradurre = [
                    domanda,                               //POS_0 = DOMANDA
                    correctAnswer];                      //POS_1 = RISPOSTA CORRETTA
                for(var x in incorrectAnswers)
                    daTradurre.push(incorrectAnswers[x]);            //POS >= 2 RISPOSTE SBAGLIATE

                console.log(daTradurre);

                //traduzione e rendering della pagina
                googleTranslate.translate(daTradurre.toString(), 'it', function(err, translation) {
                    var traduzione = translation.translatedText.split(",");
                    console.log(traduzione);
                    console.log(traduzione.slice(2));
                    console.log(traduzione[0]);

                    var hash = crypto.createHash('md5').update(traduzione[1]).digest("hex");
                    res.cookie('correct', hash);
                    console.log("-------------------------------------\n\n\n\n\n\n\n\n\n " + punteggio);
                    try{
                        res.render('sfidaNoLimits', {
                            title: 'SFIDA NO LIMITS',
                            punteggio: punteggio,
                            domanda: traduzione[0],
                            corretta: traduzione[1],
                            risposte: traduzione.slice(2)
                        });
                    }catch(exception_var){  // SE LA RICHIESTA API NON VA A BUON FINE
                        res.clearCookie("correct");
                        res.render('sfidaNoLimits', {
                            title: 'ERRORE'
                        });
                    }

                });	
            } else {
                res.clearCookie("correct");
                console.log("Error request");
            }
    });
});

//POST


router.post('/', function(req, res, next){
    //console.log('/sfidaNoLimits?cat=' + req.query['cat'].toString().split(' ').join('+').replaceAll('+&+', '+e+') + '&diff=' + req.query['diff']);

    var utente = req.cookies['username'];
    var risposta = req.body.risposta;
    var hashedrisposta = crypto.createHash('md5').update(risposta).digest("hex");
    var correctAnswer = req.cookies['correct'];

    console.log("\n\n\n\n------------------------------------------");
    console.log(correctAnswer + "\n" + risposta);
    console.log("\n\n\n\n-----------------------------------------\n\n\n\n--");

    if(correctAnswer == hashedrisposta){
        var x = parseInt(req.cookies['punteggio']);
        console.log("------------------------------------- " + x);
        x++;
        console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"" + x);
        res.cookie('punteggio', x); 
        res.redirect('/sfidaNoLimits?cat=' + req.query['cat'].toString().split(' ').join('+').replaceAll('+&+', '+e+') + '&diff=' + req.query['diff']);
    }else{
        var punteggio = parseInt(req.cookies['punteggio']);
        res.cookie('isFinished', true);
        res.clearCookie('correct');
        console.log("sto stampando utente prima dell'update "+utente);
        console.log("punteggio: " + punteggio);
        var mex = "";
        db.updateScore(utente, punteggio);
        res.redirect('/?msg=' + mex.replaceAll(" ", "+"));
    }
});

module.exports = router;
