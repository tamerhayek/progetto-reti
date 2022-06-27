require('dotenv').config();

const user = process.env.COUCHDB_USER;
const password = process.env.COUCHDB_PASSWORD;

const db = require('nano')('http://'+ user + ':' + password + '@couchserver:5984/');

function listDatabases(){
    couch.listDatabases().then(function(dbs){  
    console.log(dbs);  
    });  
}

async function getDOC(dbName, email){
    const conn = db.use(dbName);
    const doc = await conn.get(email)
    console.log(doc);
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


//*************************************************************************************************
//                                                                                  GESTIONE UTENTI

function inserisciUtente(JSON_utente){
    //controlli su JSON_utente
    //  **********************
    //  **********************
    var utente = {
        _id: JSON_utente.username,
        nome : JSON_utente.nome,
        email: JSON_utente.email,
        cognome: JSON_utente.cognome,
        password: JSON_utente.password,
        highscore_nolimits: JSON_utente.highscore_nolimits,
        highscore_timer: JSON_utente.highscore_timer
    };
    
    insertDOC("users", utente);
}

function getUtente(email){
    //EVENTUALI CONTROLLI
    //  **********************
    //  **********************
    return getDOC("users", email);
}

//*************************************************************************************************

module.exports = { inserisciUtente, getUtente }