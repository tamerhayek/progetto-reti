const e = require('express');
var express = require('express');
var router = express.Router();
var request = require('request');
require('dotenv').config();

var db = require('../db');

var googleTranslate = require('google-translate')(process.env.GOOGLE_API_KEY);

// GET NEW SFIDA
router.get('/', function(req, res, next) {
    if (req.cookies.startTime) res.clearCookie("startTime");
    if (req.cookies.isFinished) res.clearCookie("isFinished");
    if (req.cookies.correct) res.clearCookie("correct");
    if (req.cookies.punteggio) res.clearCookie("punteggio");
    var logged = false;
    if (req.cookies.username) {
        db.query("select * from users where username = $1", [
            req.cookies.username,
        ])
            .then(function (result) {
                if (result.rowCount == 1) logged = true;
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            });
    }
    request("https://the-trivia-api.com/api/categories",
        function(error, responseQuizAPI, bodyTriviaAPI) {
            if (!error && responseQuizAPI.statusCode == 200) {
                const keys = JSON.parse(bodyTriviaAPI);

                var categorieArray = [];
                for(var key in keys){
                    categorieArray.push(key);   //inserisco i nomi delle categorie in un array
                }

                //traduzione dei nomi delle categorie e rendering della pagina
                googleTranslate.translate(categorieArray.toString(), 'it', function(err, translation) {
                    //console.log("Italiano :>",translation.translatedText);
                    try{
                        console.log("\n\n" + categorieArray.toString() + "\n " + translation.translatedText + "\n\n");
                        //categorieArray.push(translation.translatedText);                         
                          res.render('newSfida', {
                            title: 'Impostazioni Sfida',
                            listaCategorieTradotto: translation.translatedText.split(','),
                            listaCategorieValue : categorieArray,
                            logged: logged
                          });
                        
                    }catch(exception_var){  // SE LA RICHIESTA API NON VA A BUON FINE
                        res.render('newSfida', {
                            title: 'ERRORE CON L\'API DI GOOGLE'
                        });
                    }

                });	
                
            } else {
                console.log("Error request");
            }
    });
});

//POST NEW SFIDA

router.post('/', function(req, res, next){
    const diff = req.body.difficolta;       // difficoltà selezionata
    const cat = req.body.cat;               // categorie scelte
    var categorie = cat.toString().split(',');
    for(let i=0; i < categorie.length; i++){
        var query = 'SELECT * from statistichecategorie where nome = \'' + categorie[i] + '\' limit 1';
        db.query(query)
            .then(function (result) {
                var q;
                if(result.rowCount == 1){   //esiste --> aggiorna tupla
                    q = 'UPDATE statistichecategorie SET rating = \'' + (result.rows[0].rating+1) + '\' WHERE id = \'' + result.rows[0].id + '\'';
                }else{  //non esiste --> aggiungi tupla
                    q = 'insert into statistichecategorie (nome, rating) values (\''+ categorie[i] + '\', \'0\')'; 
                }
                db.query(q)
                    .then(function (rst) {
                        console.log("aggiornato correttamente statistichecategorie");
                    })
                    .catch(function (err) {
                        console.log(err.stack);
                        res.send("DB Error: " + err.stack);
                });
            })
            .catch(function (err) {
                console.log(err.stack);
                res.send("DB Error: " + err.stack);
            }); 
    }
    res.redirect('/sfidaNoLimits?diff=' + diff + '&cat=' + cat.toString().split(' ').join('+').replaceAll('&', 'e'));
});

module.exports = router;
