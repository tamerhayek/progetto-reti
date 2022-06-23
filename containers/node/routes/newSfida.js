var express = require('express');
var router = express.Router();
var request = require('request');
require('dotenv').config();

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
                    categorieArray.push(translation.translatedText);
                    res.render('newSfida', {
                        title: 'Impostazioni Sfida',
                        listaCategorie: translation.translatedText.split(",")
                    });
                });	
                
            } else {
                console.log("Error request");
            }
    });
});

//GET NEW SFIDA

router.post('/', function(req, res, next){
    const diff = req.body.difficolta;       // difficoltà selezionata
    const cat = req.body.cat;               // categorie scelte
    const mod = req.body.tempo;             // modalità di gioco
    console.log(diff + "\n" + cat + "\n" + mod);
});

module.exports = router;
