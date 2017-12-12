//requiring NPM modeles

const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

const db = mongoose.connection;
db.on('error', console.error);

const app = express();

// requiring local modeles
const routes = require('./routes/routes');

const helperFunctions = require('./helpers/helperFunctions');


// Uncomment the following lines to start logging requests to consoles.
// app.use(morgan('combined'));

// parse application/x-www-form-urlencoded.
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
// parse application/json.
app.use(bodyParser.json({limit: '50mb'}));

// connedting to mongoDB
const connectionString = 'mongodb://' + config.dbHost + ':' + config.dbPort + '/' + config.dbName;
mongoose.connect(connectionString, { useMongoClient: true });
mongoose.Promise = global.Promise;

// populating data if DB is not already populated.
helperFunctions.populateDb();

// Initilizing routes.
routes(app);

// Finally starting the listener
app.listen(config.applicationPort, function () {
  console.log('Example app listening on port ' + config.applicationPort + '!');
});
