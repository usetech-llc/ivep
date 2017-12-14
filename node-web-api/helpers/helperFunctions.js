const helpers = {};
const Transactions = require('./../model/transaction.model');
const Investors = require('./../model/investor.model');

helpers.isAuthenticated = function(req, res, next){
  next();
};

//Function to populate data in DB if DB is empty.
helpers.populateDb = function(){
  const transactions = Transactions.get();
  transactions.then(function(data){
    if(data.length){
      console.log('Transactions table already populated.');
    }
    else{
      console.log('Populating Transactions table.');
      Transactions.seed();
    }
  });
  const investors = Investors.get();
  investors.then(function(data){
    if(data.length){
      console.log('Investors table already populated.');
    }
    else{
      console.log('Populating Investors table.');
      Investors.seed();
    }
  });
};

module.exports = helpers;