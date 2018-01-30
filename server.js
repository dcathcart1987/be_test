//server.js
'use strict'

const cors = require('cors');
const Promise = require('bluebird');
const express = require('express');
const fs = require('fs');
let bodyParser = require('body-parser');

const routes = require('./api/routes/TicketRoutes.js');

let app = express();
let port = process.env.PORT || 3300;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
routes(app);

app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port);

console.log('Ticket Reservation RESTful API server started on: ' + port);

module.exports = app;