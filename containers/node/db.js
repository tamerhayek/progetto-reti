const PORT=5984;

const NodeCouchdb = require('node-couchdb');  
 
const couch = new NodeCouchdb({  
auth:{  
user: 'admin',
password: 'admin'  
}  
});  
couch.listDatabases().then(function(dbs){  
console.log(dbs);  
});  

couch.get("prova", "utenti").then(({data, headers, status}) => {
    console.log(data);
}, err => {
    console.log("errore")
});