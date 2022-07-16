/**
 * @api {get} /api/classifica/:count Richiesta classifica degli utenti (con possibilità di ottenere i primi count utenti)
 * @apiName Classifica
 * @apiGroup Classifica
 *
 * @apiParam count Numero di utenti a cui si limita la classifica
 * @apiParamExample {text} Esempio-Richiesta:
 *      https://localhost/api/classifica/5
 * @apiSuccess {Number} posizione Posizione in classifica
 * @apiSuccess {String} nome Nome dell'utente
 * @apiSuccess {String} cognome Cognome dell'utente
 * @apiSuccess {String} username Username dell'utente 
 * @apiSuccess {Number} punteggio Punteggio record dell'utente
 * 
 * 
 *
 * @apiSuccessExample Success-Response:
 *     [
 *        {
 *          "posizione":1,
 *          "nome":"Diana",
 *          "cognome":"Calugaru",
 *          "username":"diana.calugaru",
 *          "punteggio":14
 *        },
 *        {
 *          "posizione":2,
 *          "nome":"Tamer",
 *          "cognome":"Hayek",
 *          "username":"tamer.hayek",
 *          "punteggio":10
 *        },
 *        {
 *          "posizione":3,
 *          "nome":"Samuele",
 *          "cognome":"Cervo",
 *          "username":"samuele.cervo",
 *          "punteggio":9
 *        }
 *     ]
 *
 * @apiError DB_error Errore nel database
 *
 * @apiErrorExample Error-Response:
 *   {  
 *      DB Error: error stack generato dal database
 *   }
 * 
 * @apiError Param_error Parametro in input troppo grande
 *
 * @apiErrorExample Error-Response:
 *   {
 *     Il numero di utenti richiesto è maggiore degli utenti attualmente registrati!
 *   }
 * 
 * 
 */
/**
 * @api {get} /api/statisticheCategorie Richiesta statistiche categorie più richieste dai giocatori
 * @apiName StatisticheCategorie
 * @apiGroup Categorie
 *
 * @apiParamExample {text} Esempio-Richiesta:
 *      https://localhost/api/statisticheCategorie
 * @apiSuccess {Number} posizione Posizione della categoria nella classifica delle categorie più usate
 * @apiSuccess {String} nome Nome della categoria
 * @apiSuccess {Number} rating Il numero di volte che la categoria è stata scelta da un giocatore 
 * 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *        {
 *          "posizione":1,
 *          "nome":"Food & Drink",
 *          "rating":87
 *        },
 *        {
 *          "posizione":2,
 *          "nome":"Sport & Leisure",
 *          "rating":64
 *        },
 *        {
 *          "posizione":3,
 *          "nome":"Film & TV",
 *          "rating":50
 *        },
 *        {
 *          "posizione":4,
 *          "nome":"Music",
 *          "rating":14
 *        }
 *      ]
 *
 * @apiError DB_error Errore nel database
 *
 * @apiErrorExample Error-Response:
 *    {
 *       DB Error: error stack generato dal database
 *    }
 * 
 */