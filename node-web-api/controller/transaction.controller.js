const transactionModel = require('./../model/transaction.model');

const transactions = {};

// controller that handles transactions listings.
transactions.getTransactions = function(skip, limit) {
  console.log('controller');
  const transactionsData = transactionModel.get(skip, limit);
  return transactionsData.then((data) => {
    return data;
  }, (err) => {
    console.log('error while fetching transactions list', err);
    return false;
  });
};

// controller that handles single transaction.
transactions.getOneTransaction = function (transactionHash, transactionNonce) {
  const transactionsData = transactionModel.getOne(transactionHash, transactionNonce);
  return transactionsData.then((data) =>{
    return data;
  }, (err) => {
    console.log('error while getting transaction by hash', err);
    return false;
  });
};
// controller that add single transaction.
transactions.insertOneTransaction = function(transaction){
  const transactionsData = transactionModel.insertOne(transaction);
  return transactionsData.then((data) => {
    return data;
  }, (err) => {
    console.log('error while inserting transaction', err);
    return false;
  });
};

// controller that update single transaction.
transactions.updateOneTransaction = function(transaction){
  const transactionsData = transactionModel.updateOne(transaction);
  return transactionsData.then((data) => {
    return data;
  }, (err) => {
    console.log('error while updating transaction', err);
    return false;
  });
};

// controller that delete single transaction.
transactions.deleteOneTransaction = function(transactionHash){
  const transactionsData = transactionModel.delete(transactionHash);
  return transactionsData.then((data) => {
    return data;
  }, (err) => {
    console.log('error while deleting transaction', err);
    return false;
  });
};

module.exports = transactions;