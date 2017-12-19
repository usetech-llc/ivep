const mongoose = require('mongoose');
const config = require('./config');
var bc = require('./blockchain-api');
const bcModel = require('./blockchainstatus.model');

// TODO: Fix this import
//const txModel = require('./../../node-web-api/model/transaction.model');
const txModel = require('./transaction.model');

// mongo db connection
const db = mongoose.connection;
db.on('error', console.error);
const connectionString = 'mongodb://' + config.dbHost + ':' + config.dbPort + '/' + config.dbName;
mongoose.connect(connectionString, { useMongoClient: true });
mongoose.Promise = global.Promise;


async function SaveTransaction(tx) {
    var existing = [];
    try {
        existing = await txModel.getOne(tx._id);
    } catch (e) {
        if (e.error.indexOf("Invalid transaction hash supplied") == -1)
            throw e;
    }

    if (existing.length == 0)
        await txModel.insertOne(tx);
}


async function DownloadBTCTask(addr) {
    // Get last reading status
    var status = await bcModel.get('BTC' + addr);
    var btcTxCount = await bc.getBTCTransactionCount(addr);
    var lastItem = 0;

    if (status === false) {
        // First time for this address
        var statusUpdate = {_id: 'BTC' + addr, totalItems: btcTxCount, lastItem: '0'};
        await bcModel.set(statusUpdate);
    } else {
        lastItem = parseInt(status.lastItem);
    }
    console.log("BTC Transaction count: " + btcTxCount);

    var skip = lastItem;
    var limit = 10;
    var failCount = 0;

    while (skip < btcTxCount) {
        console.log("Reading from " + skip + " to " + (skip+10));

        try {
            // Read a batch of transactions
            var transactions = await bc.getBTCTransactions(addr, skip, limit);

            // Save to DB
            const len = transactions.length;
            console.log("Saving to DB");
            for (var i=0; i<len; i++) {
                const tx = {
                    _id: transactions[i].hash, // Blockchain transactions hash
                    sender: '', // unknown
                    receiver: addr, // to address
                    date: new Date(transactions[i].time * 1000),
                    amount: transactions[i].amount,
                    currency: "BTC",
                    raw_data: transactions[i].raw_data,
                };

                // Save to DB
                await SaveTransaction(tx);
            }

            // Update status
            lastItem += limit;
            skip = lastItem;
            var statusUpdate = {_id: 'BTC' + addr, totalItems: btcTxCount, lastItem: lastItem.toString()};
            await bcModel.set(statusUpdate);
        } catch (e) {
            failCount++;
        }

        if (failCount > 10) return;
    }

    console.log("BTC up to date for address: " + addr);
}

async function DownloadBCHTask(addr) {
    // Get last reading status
    var status = await bcModel.get('BCH' + addr);
    var totalPageCount = await bc.getBCHPageCount(addr);
    var lastItem = 0;

    if (status === false) {
        // First time for this address
        var statusUpdate = {_id: 'BCH' + addr, totalItems: totalPageCount, lastItem: '0'};
        await bcModel.set(statusUpdate);
        console.log("BCH initial status set");
    } else {
        lastItem = parseInt(status.lastItem);
        console.log("BCH lastItem = " + lastItem);
    }
    console.log("BCH Page count: " + totalPageCount);

    var page = lastItem;
    var failCount = 0;

    while (page < totalPageCount) {
        console.log("Reading page " + page);

        try {
            // Read a batch of transactions
            var transactions = await bc.getBCHTransactions(addr, page);

            // Save to DB
            const len = transactions.length;
            console.log("Saving to DB");
            for (var i=0; i<len; i++) {
                const tx = {
                    _id: transactions[i].hash, // Blockchain transactions hash
                    sender: '', // unknown
                    receiver: addr, // to address
                    date: new Date(transactions[i].time * 1000),
                    amount: transactions[i].amount,
                    currency: "BCH",
                    raw_data: transactions[i].raw_data,
                };

                // Save to DB
                await SaveTransaction(tx);
            }

            // Update status
            page += 1;
            var statusUpdate = {_id: 'BCH' + addr, totalItems: totalPageCount, lastItem: page.toString()};
            await bcModel.set(statusUpdate);
        } catch (e) {
            failCount++;
        }

        if (failCount > 10) return;
    }

    console.log("BCH up to date for address: " + addr);
}


/**
* Read all (new) LTC transactions to an address
*
* Because block.io only allows reading transactions _before_ a transaction hash, i.e.
* older than certain transaction, fragmets of new transactions may remain unread, so
* the best approach is to read all transactions and check which ones are in the DB
* to avoid duplicates
*
* @param addr - address to query
*/
async function DownloadLTCTask(addr) {
    // Get last reading status
    var status = await bcModel.get('LTC' + addr);
    var lastItem = 0;

    if (status === false) {
        // First time for this address
        var statusUpdate = {_id: 'LTC' + addr, totalItems: 0, lastItem: ''};
        await bcModel.set(statusUpdate);
        console.log("LTC initial status set");
    } else {
        lastItem = status.lastItem;
        console.log("LTC lastItem = " + lastItem);
    }

    var failCount = 0;

    var lastReadTransactions = 2; // Last is always read, so lastReadTransactions will be euqual to 1 after the last iteration
    while (lastReadTransactions > 1) {
        console.log("Reading transactions before " + lastItem);

        try {
            // Read a batch of transactions
            var transactions = [];
            if (lastItem.length > 0) {
                transactions = await bc.getLTCTransactions(addr, config.blockIoApiKeyLTC, lastItem);
            } else {
                transactions = await bc.getLTCTransactions(addr, config.blockIoApiKeyLTC);
            }
            lastReadTransactions = transactions.length;

            console.log("LTC lastReadTransactions = " + lastReadTransactions);

            // Save to DB
            const len = transactions.length;
            console.log("Saving to DB");
            for (var i=0; i<len; i++) {
                const tx = {
                    _id: transactions[i].hash, // Blockchain transactions hash
                    sender: transactions[i].address, //
                    receiver: addr, // to address
                    date: new Date(transactions[i].time * 1000),
                    amount: transactions[i].amount,
                    currency: "LTC",
                    raw_data: transactions[i].raw_data,
                };

                // Save to DB
                await SaveTransaction(tx);
            }

            // Update status
            var statusUpdate = {_id: 'LTC' + addr, totalItems: 0, lastItem: lastItem};
            if (transactions.length > 0) {
                lastItem = transactions[transactions.length-1].hash;
                statusUpdate.lastItem = transactions[transactions.length-1].hash;
            }

            // If we are at the end, start over next time. See the comment in the method description
            if (lastReadTransactions == 1) {
                statusUpdate.lastItem = '';
            }
            await bcModel.set(statusUpdate);
        } catch (e) {
            failCount++;
            console.log("Error, increasing fail count: ", e);
        }

        if (failCount > 10) return;
    }

    console.log("LTC up to date for address: " + addr);


}

async function main() {
    try {
        await DownloadBTCTask(config.btcAddress);
        await DownloadBCHTask(config.bchAddress);
        await DownloadLTCTask(config.ltcAddress);
    } catch (error) {
        console.log("Exception: ", error);
    }

    console.log("Happy path output");
    process.exit();
}

main();
