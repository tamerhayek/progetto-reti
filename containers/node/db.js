require('dotenv').config();

const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;
const { Client } = require('pg');
const client = new Client({
    user:POSTGRES_USER,
    host:"postgres",
    database:POSTGRES_DATABASE,
    password:POSTGRES_PASSWORD,
    port: 5432
});
client.connect();


/*
const user = process.env.COUCHDB_USER;
const password = process.env.COUCHDB_PASSWORD;

const db = require('nano')('http://'+ user + ':' + password + '@couchserver:5984/');*/


//FUNZIONI PRIVATE DI ACCESSO AL DB, NON TOCCARE E NON RICHIAMARE DALL'ESTERNO

async function getDOC(dbName, id){
    const conn = db.use(dbName);
    const doc = await conn.get(id);
    //AGGIUNGERE CONTROLLI SUL DOC
    return doc;
}

async function insertDOC(dbName, JSON){
    //controlli nel DB prima dell'inserimento
    //  **********************
    //  **********************
    const conn = db.use(dbName);
    const response = await conn.insert(JSON);
    //AGGIUNGERE CONTROLLI SULl'INSERIMENTO DEL FILE
    console.log("RISPOSTA COUCH: " + response);
}

async function updateField(dbName, field, username, newValue){
    const conn = db.use(dbName);
    getUtente(username).then(function(user) {
      user[field] = newValue;
      conn.insert(user, user._id, 
      function (error, response) {
        if(!error) {
          return 0;
        } else {
          return -1;
        }
      });
    });
}


//FUNZIONI PUBBLICHE

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
    
    //AGGIUNGERE CONTROLLI SUL RETURN
    insertDOC("users", JSON_utente);
}

function getUtenti(){
    //EVENTUALI CONTROLLI
    //  **********************
    //  **********************
    //return getDOC("users", id);
}

async function updateScore(username, punteggio, flag){            //si può richiamare con o senza flag, se il flag è 'f' forza l'aggiornamento
    var utente = await getUtente(username);
    if(punteggio > utente.highscore_nolimits || flag == 'f')
        return updateField("users", "highscore_nolimits", username, punteggio);
    else
        return -1;
}
//*************************************************************************************************

module.exports = { inserisciUtente, getUtenti, updateScore, client }