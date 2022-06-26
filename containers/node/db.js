require('dotenv').config();

const user = process.env.COUCHDB_USR;
const password = process.env.COUCHDB_PSW;

const db = require('nano')('http://'+ user + ':' + password + '@couchserver:5984/');

function listDatabases(){
    couch.listDatabases().then(function(dbs){  
    console.log(dbs);  
    });  
}

function getDOC(dbName, DOCName){
    couch.get(dbName, DOCName).then(({data, headers, status}) => {
        return data;
    }, err => {
        return(err);
    });
}



function insertDOC(dbName, nomeDOC, JSON){
    const doc = db.use(dbName);
    const response = doc.insert(JSON);
    console.log("RISPOSTA COUCH: " + response);

    /*couch.insert(dbName, JSON).then(({data, headers, status}) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        console.log("Inserito il documento" + JSON);
        return data;
    }, err => {
        // either request error occured
        // ...or err.code=EDOCCONFLICT if document with the same id already exists
        console.log("Impossibile inserire il documento" + JSON);
        return err;
    });*/
}

function inserisciPartita(utente, modalita, categorie, difficolta){
    var partita = {
        utente: utente,
        modalita: modalita,
        categorie: categorie,
        difficolta: difficolta
    };
    
    insertDOC("prova", "partite", partita);
}

module.exports = { insertDOC, getDOC, listDatabases }