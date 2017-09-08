"use strict";
var mongoose = require('mongoose');
var passport = require('passport');
require('./models/Records');
require('./models/Comments');
require('./models/User');
require('./config/passport');
mongoose.connect('mongodb://silfrainvoice:invoice@ds127864.mlab.com:27864/silfrainvoice');

var bodyParser = require('body-parser');

// init project
var express = require('express');
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Authentication
app.use(passport.initialize());

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/invoices", function (request, response) {
  response.send(invoices);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/invoices", function (request, response) {
  invoices.push(request.query.invoice);
  response.sendStatus(200);
});

// Simple in-memory store for now
var invoices = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

var routes = require('./routes/index');
app.use('/',routes);  

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
 