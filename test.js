const PORT = 3000;
require("dotenv").config();

var express = require("express");

var app = express();

app.listen(PORT, () => {
    console.log(`Server Docker listening on http://localhost`);
    console.log(`Server Nodemon listening on http://localhost:${PORT}`);
});

module.exports = app;
