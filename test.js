const chai = require("chai");
const chaiHttp = require("chai-http");
const describe = require("mocha").describe;
const it = require("mocha").it;

chai.use(chaiHttp);
chai.should();

describe("Test delle API", () => {
    it("/api/classifica 200 OK + ARRAY senza limitazioni", (done) => {
        console.log(
            "\n     /api/classifica 200 OK + ARRAY senza limitazioni\n"
        );
        chai.request("http://localhost/api")
            .get("/classifica")
            .end((err, res) => {
                res.should.have.status(200);
                console.log("\tHave body");
                res.should.have.property("body");
                console.log("\tIs Array");
                res.body.should.be.an("array");
                if (res.body.length != 0) {
                    console.log("\tHave 'posizione'");
                    res.body[0].should.have.own.property("posizione");
                    console.log("\tHave 'nome'");
                    res.body[0].should.have.own.property("nome");
                    console.log("\tHave 'cognome'");
                    res.body[0].should.have.own.property("cognome");
                    console.log("\tHave 'username'");
                    res.body[0].should.have.own.property("username");
                    console.log("\tHave 'punteggio'");
                    res.body[0].should.have.own.property("punteggio");
                } else {
                    console.log("\tEmpty Array -> skip controls");
                }
                done();
            });
    });

    it("/api/classifica 200 OK + ARRAY con limite 0", (done) => {
        console.log("\n     /api/classifica 200 OK + ARRAY con limite 0\n");
        chai.request("http://localhost/api")
            .get("/classifica/0")
            .end((err, res) => {
                res.should.have.status(200);
                console.log("\tHave body");
                res.should.have.property("body");
                console.log("\tIs Array");
                res.body.should.be.an("array");
                res.body.length.should.be.equal(0);
                done();
            });
    });

    it("/api/classifica 200 OK + ARRAY con limite = 3", (done) => {
        console.log("\n     /api/classifica 200 OK + ARRAY con limite = 3\n");
        chai.request("http://localhost/api")
            .get("/classifica/3")
            .end((err, res) => {
                res.should.have.status(200);
                console.log("\tHave body");
                res.should.have.property("body");
                console.log("\tIs Array");
                res.body.should.be.an("array");
                console.log("\tLimit correct");
                res.body.length.should.be.oneOf([0, 1, 2, 3]);
                if (res.body.length != 0) {
                    console.log("\tHave 'posizione'");
                    res.body[0].should.have.own.property("posizione");
                    console.log("\tHave 'nome'");
                    res.body[0].should.have.own.property("nome");
                    console.log("\tHave 'cognome'");
                    res.body[0].should.have.own.property("cognome");
                    console.log("\tHave 'username'");
                    res.body[0].should.have.own.property("username");
                    console.log("\tHave 'punteggio'");
                    res.body[0].should.have.own.property("punteggio");
                } else {
                    console.log("\tEmpty Array -> skip controls");
                }
                done();
            });
    });

    it("/api/statisticheCategorie 200 OK + ARRAY", (done) => {
        console.log("\n     /api/statisticheCategorie 200 OK + ARRAY\n");
        chai.request("http://localhost/api")
            .get("/statisticheCategorie")
            .end((err, res) => {
                res.should.have.status(200);
                console.log("\tHave body");
                res.should.have.property("body");
                console.log("\tIs Array");
                res.body.should.be.an("array");
                if (res.body.length != 0) {
                    console.log("\tHave 'posizione'");
                    res.body[0].should.have.own.property("posizione");
                    console.log("\tHave 'nome'");
                    res.body[0].should.have.own.property("nome");
                    console.log("\tHave 'rating'");
                    res.body[0].should.have.own.property("rating");
                } else {
                    console.log("\tEmpty Array -> skip controls");
                }
                done();
            });
    });
});
