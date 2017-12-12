var helpers = require('./../helpers/helperFunctions');
var transactions = require('./../controller/transaction.controller');

const routesAPI = function(app) {
//articles api routes
  app.get('/api/transactions', helpers.isAuthenticated, transactions.get);
  app.get('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.getOne);
  app.post('/api/transactions', helpers.isAuthenticated, transactions.insertOne);
  app.put('/api/transactions', helpers.isAuthenticated, transactions.updateOne);
  app.delete('/api/transactions/:transactionId', helpers.isAuthenticated, transactions.delete);
};