const PORT = 3000;
require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
var newSfida = require("./routes/newSfida");
var sfidaNoLimits = require("./routes/sfidaNoLimits");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "secret",
        secure: false,
        resave: false,
        saveUninitialized: false,
    })
);

app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/newSfida", newSfida);
app.use("/sfidaNoLimits", sfidaNoLimits);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

app.listen(PORT, () => {
    console.log(`Server Docker listening on http://localhost`);
    console.log(`Server Nodemon listening on http://localhost:${PORT}`);
});

module.exports = app;
