const helpers = require('./../helpers/helperFunctions');
const transactions = require('./../controller/transaction.controller');
const investors = require('./../controller/investor.controller');

const routesAPI = function(app) {
  // transactions api routes
  app.get('/api/transactions', helpers.isAuthenticated, transactions.get);
  app.get('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.getOne);
  app.post('/api/transactions', helpers.isAuthenticated, transactions.insertOne);
  app.put('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.updateOne);
  app.delete('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.delete);

  // investors api routes
  app.get('/api/investors', helpers.isAuthenticated, investors.get);
  app.get('/api/investors/:investorId', helpers.isAuthenticated, investors.getOne);
  app.post('/api/investors', helpers.isAuthenticated, investors.insertOne);
  app.put('/api/investors/:investorId', helpers.isAuthenticated, investors.updateOne);
  app.delete('/api/investors/:investorId', helpers.isAuthenticated, investors.delete);
};