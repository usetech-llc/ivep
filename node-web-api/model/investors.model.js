const mongoose = require('mongoose');
var q = require('q');
var path = require("path");

const Schema = mongoose.Schema;

const investorsSchema = new Schema({
  wallets: [Wallet],
  transactions: [Transaction],
});

//To use our schema definition, we need to convert our schema into a Model we can work with
const Investor = mongoose.model('investors', investorsSchema);

//Initlizing interface object of this model.
const investorsModel = {};

//function to get Investor listings
investorsModel.get = function(skip, limit){
  var results = q.defer();
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 999999999;
  console.log('investorsModel');
  Investor.find({}, function(err, dbInvestors) {
    if (err){
      results.reject(err);
    }
    results.resolve(dbInvestors);
  }).skip(skip).limit(limit);
  return results.promise;
};

// Get single Investor by its id.
investorsModel.getOne = function(investorId){
  var results = q.defer();

  if(!investorId){
    results.reject({ status:'error', error:'investorId not supplied.' });
  }
  Investor.findOne({ _id: investorId }, function(err, dbInvestor) {
    if (err){
      results.reject(err);
    }

    if(dbInvestor){
      results.resolve(dbInvestor);
    } else{
      results.reject({status:'error', error:'Invalid investor id supplied.'});
    }
  });
  return results.promise;
};

// Insert investor into database
investorsModel.insertOne = function(investor){
  var results = q.defer();
  var error = checkInputError(investor);
  if(error){
    results.reject({ status:'error', error:error });
  }
  var investors = [];
  // Insert investor
  if(!error){
    investors.push(investor);
    Investor.collection.insert(investors, function(err, dbInvestor) {
      if(err){
        console.log('error occured in populating database');
        console.log(err);
      }
      else{
        // console.log('investor inserted');
        results.resolve(dbInvestor);
      }
    });
  }
  return results.promise;
};

// update investor
investorsModel.updateOne = function(investor) {
  var results = q.defer();
  var error = checkInputError(investor);
  if(error){
    results.reject({ status:'error', error:error });
  }
  // find and update investor
  if(!error) {
    Investor.findOne({ _id: investor.id }, function (err, dbInvestor) {
      if (err) {
        return results.reject(err);
      }
      for (let k in investor) dbInvestor[k] = dbInvestor[k];
      dbInvestor.save();
      results.resolve(dbInvestor);
    });
  }
  else{
    results.reject(err);
  }
  return results.promise;
};

//delete investor
investorsModel.delete = function(investorId){
  var results = q.defer();
  var error = false;
  if(!investorId){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if(!error){
    console.log(investorId);
    Investor.findOne({ _id:investorId }, function(err, dbInvestor) {
      if (err){
        results.reject(err);
      }
      dbInvestor.remove();
      results.resolve(dbInvestor);
    });
  }
  return results.promise;
};

investorsModel.seed = function(data) {
  const investors = [
    {
      sender: '0xb794F5eA0ba39494cE839613fffBA74279579268',
      receiver: '0xF432cEc23b2A0d6062B969467f65669De81F4653',
      date: new Date(),
      amount: 100,
      currency: 'BTC',
      hash: '07e7b291422b17165a4ba32de1e6245b68fa16b8a1d4d443d1b0dc4498e3367b',
      nonce: 1,
    },
    {
      sender: '0xe50365f5d679cb98a1dd62d6f6e58e59321bcddf',
      receiver: '0xdf6ef343350780bf8c3410bf062e0c015b1dd671',
      date: new Date(),
      amount: 200,
      currency: 'ETH',
      hash: '07e7b291422b17165a4ba32de1e6245b68fa16b8a1d4d443d1b0dc4498e3367b',
      nonce: 2,
    }
  ];

  Investor.collection.insert(investors, function(err, dbInvestors) {
    if(err){
      console.log('error occured in populating database');
      console.log(err);
    }
    else{
      console.log('investor table populated.', dbInvestors.length);
    }
  });
};

//check input validation
function checkInputError(investor) {
  return false;
}


module.exports = investorsModel;
