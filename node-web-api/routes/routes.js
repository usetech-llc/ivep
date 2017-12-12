//fetching all routes files.
const api = require('./api');

const routes = function(app){
  //Initilizing routes
  api(app);
};

module.exports = routes;