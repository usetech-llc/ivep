const mongoose = require('mongoose');
var q = require('q');
var path = require("path");

const Schema = mongoose.Schema;

const listOfCurrencies = ["BTC", "BCH", "LTC", "ETH", "USD", "CAD"];

const transactionsSchema = new Schema({
  sender: String,
  receiver: String,
  date: { type: Date, default: Date.now },
  amount: Number,
  currency: { type: String, enum: listOfCurrencies, default: listOfCurrencies[0] },
  hash: String,
  nonce: Number,
});

//To use our schema definition, we need to convert our schema into a Model we can work with
const Transaction = mongoose.model('transactions', transactionsSchema);

//Initlizing interface object of this model.
const transactionModel = {};

//function to get transactions listings
transactionModel.get = function(skip, limit){
  var results = q.defer();
  skip = parseInt(skip) || 0;
  limit = parseInt(limit) || 999999999;
  console.log('transactionModel');
  Transaction.find({}, function(err, dbTransaction) {
    if (err){
      results.reject(err);
    }
    results.resolve(dbTransaction);
  }).skip(skip).limit(limit);
  return results.promise;
};

// Get single transaction by its id.
transactionModel.getOne = function(transactionHash, transactionNonce){
  var results = q.defer();

  if(!transactionHash || !transactionNonce){
    results.reject({ status:'error', error:'Transaction Hash or Nonve not supplied.' });
  }
  Transaction.findOne({ hash: transactionHash, nonce: transactionNonce }, function(err, dbTransactions) {
    if (err){
      results.reject(err);
    }

    if(dbTransactions){
      results.resolve(dbTransactions);
    } else{
      results.reject({status:'error', error:'Invalid transaction hash supplied.'});
    }
  });
  return results.promise;
};

// Insert transaction into database
transactionModel.insertOne = function(transaction){
  var results = q.defer();
  var error = checkInputError(transaction);
  if(error){
    results.reject({ status:'error', error:error });
  }
  var transactions = [];
  // Insert transaction
  if(!error){
    transactions.push(transaction);
    Transaction.collection.insert(transactions, function(err, dbTransaction) {
      if(err){
        console.log('error occured in populating database');
        console.log(err);
      }
      else{
        // console.log('transaction inserted');
        results.resolve(dbTransaction);
      }
    });
  }
  return results.promise;
};

// update transaction
transactionModel.updateOne = function(transaction) {
  var results = q.defer();
  var error = checkInputError(transaction);

  if(error){
    results.reject({ status:'error', error:error });
  }

  // find and update transaction
  if(!error) {
    Transaction.findOne({ _transactionHash: transaction._transactionHash}, function (err, dbTransaction) {
      if (err) {
        return results.reject(err);
      }
      for (let k in transaction) dbTransaction[k] = transaction[k];
      dbTransaction.save();
      results.resolve(dbTransaction);
    });
  }
  else{
    results.reject(err);
  }
  return results.promise;
};

//delete transaction
transactionModel.delete = function(transactionHash){
  var results = q.defer();
  var error = false;
  if(!transactionHash){
    results.reject({ status:'error', error:error });
    error = true;
  }
  if(!error){
    console.log(transactionHash);
    Transaction.findOne({ _transactionHash:transactionHash }, function(err, dbTransaction) {
      if (err){
        results.reject(err);
      }
      dbTransaction.remove();
      results.resolve(dbTransaction);
    });
  }
  return results.promise;
};

transactionModel.seed = function(data) {
  const transactions = [
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

  Transaction.collection.insert(transactions, function(err, dbTransactions) {
    if(err){
      console.log('error occured in populating database');
      console.log(err);
    }
    else{
      console.log('Transactions table populated.', dbTransactions.length);
    }
  });
};

//check input validation
function checkInputError(transaction) {
  return false;
}


module.exports = transactionModel;
