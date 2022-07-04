var express = require('express');
var router = express.Router();
var request = require('request');
require('dotenv').config();

var googleTranslate = require('google-translate')(process.env.GOOGLE_API_KEY);

// GET
router.get('/', function(req, res, next) {
    //console.log(req.query['diff'] + "\n" + req.query['username'] + '\n' + req.query['cat'] + '\n');
    const url = "https://the-trivia-api.com/api/questions?categories=" + req.query['cat'].split(' ').join('_').replaceAll('_e_', '_&_') + "&limit=1&difficulty=" + req.query['diff'];
    console.log("REQUEST URL TO QUIZ API: \n" + url + "\n");
    request(url, function(error, responseQuizAPI, bodyTriviaAPI) {
            if (!error && responseQuizAPI.statusCode == 200) {
                const json = JSON.parse(bodyTriviaAPI);

                var id_domanda = json[0].id;
                var domanda = json[0].question;
                var incorrectAnswers = json[0].incorrectAnswers;
                var correctAnswer = json[0].correctAnswer;

                /*
                console.log("Domanda: " + domanda + "\n");
                for(var x in incorrectAnswer)
                    console.log("Risp. " + incorrectAnswer[x] + "\n");
                console.log("Risposta: " + correctAnswer + "\n");
                */

                var daTradurre = [
                    domanda,                               //POS_0 = DOMANDA
                    correctAnswer];                      //POS_1 = RISPOSTA CORRETTA
                for(var x in incorrectAnswers)
                    daTradurre.push(incorrectAnswers[x]);            //POS >= 2 RISPOSTE SBAGLIATE

                console.log(daTradurre);

                //traduzione e rendering della pagina
                googleTranslate.translate(daTradurre.toString(), 'it', function(err, translation) {
                    //console.log("Italiano :>",translation.translatedText.toString()  + "\n");
                    //console.log("JSON " , JSON.parse(translation.translatedText) + "\n")
                    var traduzione = translation.translatedText.split(",");
                    console.log(traduzione);
                    console.log(traduzione.slice(2));
                    console.log(traduzione[0]);
                    //console.log(traduzione.slice(2));

                    req.session.correctAnswer = traduzione[1];
                    req.session.prova2 = 'ciao2';

                    try{
                        res.render('sfidaNoLimits', {
                            title: 'SFIDA NO LIMITS',
                            domanda: traduzione[0],
                            corretta: traduzione[1],
                            risposte: traduzione.slice(2)
                        });
                    }catch(exception_var){  // SE LA RICHIESTA API NON VA A BUON FINE
                        res.render('sfidaNoLimits', {
                            title: 'ERRORE'
                        });
                    }

                });	
            } else {
                console.log("Error request");
            }
    });
});

//POST

router.post('/', function(req, res, next){
    //console.log('/sfidaNoLimits?cat=' + req.query['cat'].toString().split(' ').join('+').replaceAll('+&+', '+e+') + '&diff=' + req.query['diff']);
    console.log("\n\n\n----------------------------------------------------\nRISPOSTA\n");
    console.log("corretta: " + req.session.correctAnswer );
    console.log("\nrisposta: " + req.query.risposta);
    console.log("\n\n\n----------------------------------------------------\n");
    res.redirect('/sfidaNoLimits?cat=' + req.query['cat'].toString().split(' ').join('+').replaceAll('+&+', '+e+') + '&diff=' + req.query['diff']);
});

module.exports = router;
