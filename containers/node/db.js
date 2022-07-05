require('dotenv').config();

const user = process.env.COUCHDB_USER;
const password = process.env.COUCHDB_PASSWORD;

const db = require('nano')('http://'+ user + ':' + password + '@couchserver:5984/');

async function getDOC(dbName, id){
    const conn = db.use(dbName);
    const doc = await conn.get(id);
    return doc;
}

async function insertDOC(dbName, JSON){
    //controlli nel DB prima dell'inserimento
    //  **********************
    //  **********************
    const conn = db.use(dbName);
    const response = await conn.insert(JSON);
    console.log("RISPOSTA COUCH: " + response);
}

async function updateField(dbName, field, docName, newValue){
    const conn = db.use(dbName);
    conn.insert({"highscore_nolimits": 0}, "diana.calugaru", function (error, foo) {
        if(error) {
          return console.log("I failed");
        }
        db.insert({foo: 5, "_rev": foo.rev}, "foobar", 
        function (error, response) {
          if(!error) {
            console.log("it worked");
          } else {
            console.log("sad panda");
          }
        });
      });

}
//*************************************************************************************************
//                                                                                  GESTIONE UTENTI

function inserisciUtente(JSON_utente){
    //controlli su JSON_utente
    //  **********************
    //  **********************

    /* SCHEMA JSON
     var utente = {
        _id: JSON_utente.username,
        nome : JSON_utente.nome,
        cognome: JSON_utente.cognome,
        email: JSON_utente.email,
        password: JSON_utente.password,
        highscore_nolimits: JSON_utente.highscore_nolimits,
        highscore_timer: JSON_utente.highscore_timer
    }; */
    
    insertDOC("users", JSON_utente);
}

function getUtente(id){
    //EVENTUALI CONTROLLI
    //  **********************
    //  **********************
    return getDOC("users", id);
}

async function updateScore(username, punteggio){
    var utente = await getUtente(username);
    console.log("punteggio attuale" + utente.nome)
    if(punteggio > utente.highscore_nolimits){
        updateField("users","highscore_nolimits", username, punteggio);
    }
    else{
        console.log("non serve l'aggirnamento del punteggio");
    }
}
//*************************************************************************************************

module.exports = { inserisciUtente, getUtente, updateScore }