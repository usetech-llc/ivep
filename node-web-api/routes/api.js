const helpers = require('./../helpers/helperFunctions');
const transactions = require('./../controller/transaction.controller');
const investor = require('./../controller/investor.controller');

const routesAPI = function(app) {
  // transactions api routes
  app.get('/api/transactions', helpers.isAuthenticated, transactions.getTransactions);
  app.get('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.getOneTransaction);
  app.post('/api/transactions', helpers.isAuthenticated, transactions.insertOneTransaction);
  app.put('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.updateOneTransaction);
  app.delete('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.deleteOneTransaction);

  // investors api routes
  app.get('/api/investors', helpers.isAuthenticated, investor.getInvestors);
  app.get('/api/investors/:investorId', helpers.isAuthenticated, investor.getOneInvestor);
  app.post('/api/investors', helpers.isAuthenticated, investor.insertOneInvestor);
  app.put('/api/investors/:investorId', helpers.isAuthenticated, investor.updateOneInvestor);
  app.delete('/api/investors/:investorId', helpers.isAuthenticated, investor.deleteOneInvestor);
};

module.exports = routesAPI;