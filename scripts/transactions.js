const http = require('http');
var https = require('https');
const fs = require("fs");
const bodyParser = require('body-parser');
const config = require('./config');

const btc = {
    data: [],
    total: 0,
};
const bch = {
    data: [],
    total: 0,
};
let btcOffset = 0;
let bchOffset = 0;
const BTCurl = 'https://blockchain.info/address/' + config.btcAddress + '?format=json&offset=';

transactionManager();

async function transactionManager() {
    btc.data = await getBTCTransactions(config.btcAddress);
    bch.data = await getBCHTransactions(config.btcAddress);
}

async function getBTCTransactions() {
    let url = BTCurl + btcOffset;
    try {
        const res = await doRequest(url);
        if (res != '') {
            // save total number of transactions
            if (res.n_tx) {
                btc.total = res.n_tx;
            }
            // save transactions
            if (res.txs) {
                btc.data = btc.data.concat(res.txs);
            }
            // if we got not all transactions
            if (btc.total > 50) {
                //let's find how many requests we need to do
                const requestsCount = Math.ceil(btc.total / 50) - 1; //because first page we already got
                console.log('requestsCount = ', requestsCount);
                if (requestsCount > 0){
                    const otherTransactions = await getBtcTransactionsAsync(requestsCount);
                    console.log('other = ', otherTransactions.length);
                    btc.data = btc.data.concat(otherTransactions);
                    writeTransactionsToFile('btc.txt', JSON.stringify(btc));
                }

            }
            console.log('btcRes = ', btc.data.length, btc.total);
            return true;
        }
    } catch (error) {
        console.log("Got an request error: ", error);
    }
    return false;
}

async function getBCHTransactions() {
    var url = 'https://bitcoincash.blockexplorer.com/api/txs?address=' + config.bchAddress + '&pageNum=' + bchOffset;
    try {
        const res = await doRequest(url);
        if (res !== '') {
            // save total number of pages
            if (res.pagesTotal) {
                bch.total = res.pagesTotal;
            }
            // save transactions
            if (res.txs) {
                bch.data.push(res.txs);
            }
            // if we got not all transactions
            if (bch.total >= 1) {
                //let's find how many requests we need to do
               /* const requestsCount = Math.ceil(btc.total / 50) - 1; //because first page we already got
                console.log('requestsCount = ', requestsCount);
                if (requestsCount > 0){
                    const otherTransactions = await getTransactionsAsync(requestsCount);
                    console.log('other = ', otherTransactions.length);
                    btc.data = btc.data.concat(otherTransactions);
                    writeTransactionsToFile('btc.txt', JSON.stringify(btc));
                }*/
                writeTransactionsToFile('bch.txt', JSON.stringify(bch));
            }
            console.log('bch = ', bch.data.length, bch.total);
            return true;
        }
    } catch (error) {
        console.log("Got an request error: ", error);
    }
    return false;
}

function doRequest(url) {
    return new Promise((resolve, reject) => {
        let req = https.get(url, (res) => {
            let response = '';
            res.on('data', (chunk) => {
                response += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(response));
            });
            req.end();
            req.on('error', err => {
                reject(err);
            });
        });
    });
}

function writeTransactionsToFile(fileName, data) {
    fs.writeFile(fileName, data, function(err) {
        if (err) throw err;
        console.log('transaction file saved');
    });
}

async function getBtcTransactionsAsync(requestsCount) {
    return new Promise((resolve, reject) => {
        let allTransactions = [];
        getTransactionAsync(1, () => {
            resolve(allTransactions);
        }, (err) => {
            console.log('rejection error = ', err);
            reject(err);
        });
        async function getTransactionAsync(index, callback) {
            let url = BTCurl + (50 * index);
            console.log('url = ', url);
            const StopException = {};
            try {
                if (index > requestsCount) {
                    throw StopException;
                }
                const res = await doRequest(url);
                console.log('fetched and saved transaction', index, res.txs.length);
                allTransactions = allTransactions.concat(res.txs);
                getTransactionAsync(index + 1, callback);
            } catch(err) {
                if (err !== StopException) {
                    console.log('error in recursive', err);
                }
                callback();
            }
        }
    });
}