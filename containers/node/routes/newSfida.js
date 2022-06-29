var express = require('express');
var router = express.Router();
var request = require('request');
require('dotenv').config();

var db = require('../db');

var googleTranslate = require('google-translate')(process.env.GOOGLE_API_KEY);

// GET NEW SFIDA
router.get('/', function(req, res, next) {
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
                            listaCategorieValue : categorieArray
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
    const mod = req.body.tempo;             // modalità di gioco
    const USER_ID = "username,DaPrendereInSESSION";
    console.log( "\n" + cat.toString().split(' ').join('+').replaceAll('&', 'e') );
    if(mod == 'limitato'){
        res.redirect('/sfidaTimer');
    }else if(mod == 'illimitato'){
        res.redirect('/sfidaNoLimits?diff=' + diff + '&username=' + USER_ID + '&cat=' + cat.toString().split(' ').join('+').replaceAll('&', 'e'));
    }
});

module.exports = router;
