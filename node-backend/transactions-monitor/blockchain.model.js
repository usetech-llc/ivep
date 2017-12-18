const mongoose = require('mongoose');
var q = require('q');
var path = require("path");

const Schema = mongoose.Schema;

const blockchainStatusDataModel = {
    netid: '', // Blockchain ID (BTC. BCH, LTC, ETH, ...)
    lastItem: '', // Id of last item read (page, txid, tx number, etc...)
};

const blockchainStatusSchema = new Schema({
    netid: String,
    lastItem: String,
});


//To use our schema definition, we need to convert our blogSchema into a Model we can work with
const BlockchainStatus = mongoose.model('blockchainstatus', blockchainStatusSchema);

//Initlizing interface object of this model.
const blockchainStatusModel = {};

//function to get blockchain status
blockchainStatusModel.get = function(networkId) {
    var results = q.defer();
    BlockchainStatus.find({}, function(err, bcRecord) {
        if (err) {
            results.reject(err);
        }
        results.resolve(bcRecord);
    });
    return results.promise;
};

// Insert blockchain status into database
blockchainStatusModel.insertOne = function(bcRecord) {
    var results = q.defer();
    var recordsToInsert = [];
    // Insert record
    recordsToInsert.push(bcRecord);
    BlockchainStatus.collection.insert(recordsToInsert, function(err, bcRecord) {
        if(err) {
            console.log('error in blockchainStatusModel.insertOne');
            console.log(err);
        } else {
            results.resolve(bcRecord);
        }
    });

    return results.promise;
};

module.exports = blockchainStatusModel;
