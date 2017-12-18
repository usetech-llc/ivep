const mongoose = require('mongoose');
const config = require('./config');
var bc = require('./blockchain-api');
const bcModel = require('./blockchainstatus.model');

// mongo db connection
const db = mongoose.connection;
db.on('error', console.error);
const connectionString = 'mongodb://' + config.dbHost + ':' + config.dbPort + '/' + config.dbName;
mongoose.connect(connectionString, { useMongoClient: true });
mongoose.Promise = global.Promise;


async function DownloadBTC() {
    var btcTxCount = await bc.getBTCTransactionCount(config.btcAddress);
    console.log("BTC Transaction count: " + btcTxCount);

    var transactions = await bc.getBTCTransactions(config.btcAddress, 0, 10);
}

async function DownloadBCH() {
    var bchTxCount = await bc.getBCHPageCount(config.bchAddress);
    console.log("BCH Page count: " + bchTxCount);

    var transactions = await bc.getBCHTransactions(config.bchAddress, 0);
    console.log("Downloaded transactions: " + transactions.length);
}

async function DownloadLTC() {
    var transactions = await bc.getLTCTransactions(config.ltcAddress, config.blockIoApiKeyLTC);
    console.log("LTC Transaction count: ", transactions.length);
}



//DownloadBTC();
//DownloadBCH();

async function main() {
    try {

        var record = {netid: 'LTC', lastItem: '123'};

        await bcModel.insertOne(record);
        var test = await bcModel.get('LTC');
        console.out("test = " + test);


        //await DownloadLTC();

    } catch (error) {
        console.log("Exception: ", error);
    }

    console.log("Happy path output");
}

main();
