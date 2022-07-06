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

                if(req.cookies['correct']===undefined || req.cookies['isFinished'] == 'false'){     //inizializzazione counter punteggio
                    res.cookie('punteggio', '0');   
                    punteggio = 0;        
                }
                
                var domanda = json[0].question;
                var incorrectAnswers = json[0].incorrectAnswers;
                var correctAnswer = json[0].correctAnswer;
                
                res.cookie('isFinished', false);
                

                var daTradurre = [
                    domanda,                               //POS_0 = DOMANDA
                    correctAnswer];                      //POS_1 = RISPOSTA CORRETTA
                for(var x in incorrectAnswers)
                    daTradurre.push(incorrectAnswers[x]);            //POS >= 2 RISPOSTE SBAGLIATE


                //traduzione e rendering della pagina
                googleTranslate.translate(daTradurre.toString(), 'it', function(err, translation) {
                    if(!err){
                        var traduzione = translation.translatedText.split(",");
                
                        var allanswers = traduzione.slice(2);
                        allanswers.push(traduzione[1]);
                        
                        var randomIndex;
                        for(var i = allanswers.length; i > 0; ){
                             // Pick a remaining element.
                            randomIndex = Math.floor(Math.random() * i);
                            i--;
                            // And swap it with the current element.
                            [allanswers[i], allanswers[randomIndex]] = [
                              allanswers[randomIndex], allanswers[i]];
                        }


                        var hash = crypto.createHash('md5').update(traduzione[1]).digest("hex");
                        res.cookie('correct', hash);
                        
                        res.render('sfidaNoLimits', {
                            title: 'SFIDA NO LIMITS',
                            punteggio: punteggio,
                            domanda: traduzione[0],
                            risposte: allanswers
                        });
                    }else{
                        res.clearCookie('punteggio');
                        res.clearCookie("correct");
        
                        res.render('/', {
                            messaggio: 'Impossibile giocare adesso, riprova più tardi!'
                        });
                    }
                });	
            } else {
                res.clearCookie('punteggio');
                res.clearCookie("correct");

                res.render('/', {
                    messaggio: 'Impossibile giocare adesso, riprova più tardi!'
                });
            }
    });
});

//POST


router.post('/', function(req, res, next){
    var utente = req.cookies['username'];
    var risposta = req.body.risposta;
    var hashedrisposta = crypto.createHash('md5').update(risposta).digest("hex");
    var correctAnswer = req.cookies['correct'];

    res.cookie('isFinished', true);

    if(correctAnswer == hashedrisposta){
        var x = parseInt(req.cookies['punteggio']);
        x++;
        res.cookie('punteggio', x); 
        res.redirect('/sfidaNoLimits?cat=' + req.query['cat'].toString().split(' ').join('+').replaceAll('+&+', '+e+') + '&diff=' + req.query['diff']);
    }else{
        var punteggio = parseInt(req.cookies['punteggio']);
        res.clearCookie('correct');
        res.clearCookie('punteggio');
        var mex = "";
        db.updateScore(utente, punteggio);
        res.redirect('/?msg=' + mex.replaceAll(" ", "+"));
    }
});

module.exports = router;
