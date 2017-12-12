const helpers = {};
const Transactions = require('./../model/transaction.model');

helpers.isAuthenticated = function(req, res, next){
  next();
};

//Function to populate data in DB if DB is empty.
helpers.populateDb = function(){
  var promise = Transactions.get();
  promise.then(function(data){
    if(data.length){
      console.log('Transactions table already populated.');
    }
    else{
      console.log('Populating Transactions table.');
      Transactions.seed();
    }
  });
};

module.exports = helpers;