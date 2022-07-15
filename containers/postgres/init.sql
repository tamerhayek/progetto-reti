CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome character varying(30) NOT NULL,
    cognome character varying(30) NOT NULL,
    username character varying(30) NOT NULL UNIQUE,
    email character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    logged_with character varying(10) DEFAULT 'local',
    access_token character varying(1000) DEFAULT '',
    refresh_token character varying(1000) DEFAULT '',
    punteggio integer DEFAULT 0
);