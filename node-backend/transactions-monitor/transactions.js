const http = require('http');
const https = require('https');
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
const BCHurl = 'https://bitcoincash.blockexplorer.com/api/txs?address=' + config.bchAddress + '&pageNum=';

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
                    const otherTransactions = await getTransactionsAsync(requestsCount, 'btc');
                    btc.data = btc.data.concat(otherTransactions);
                    writeTransactionsToFile('btc.txt', JSON.stringify(btc));
                }
            }
            return true;
        }
    } catch (error) {
        console.log("Got an request error: ", error);
    }
    return false;
}

async function getBCHTransactions() {
    let url = BCHurl + bchOffset;
    console.log('bch url = ', url);
    try {
        const res = await doRequest(url);
        if (res !== '') {
            // save total number of pages
            if (res.pagesTotal) {
                bch.total = res.pagesTotal;
            }
            // save transactions
            if (res.txs) {
                bch.data = bch.data.concat(res.txs);
            }
            // if we got not all transactions
            if (bch.total >= 1) {
                const requestsCount = bch.total - 1;
                const otherTransactions = await getTransactionsAsync(requestsCount, 'bch');
                bch.data = bch.data.concat(otherTransactions);
                writeTransactionsToFile('btc.txt', JSON.stringify(btc));
                console.log('bch = ', bch.data.length, bch.total);
            }
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

async function getTransactionsAsync(requestsCount, type) {
    return new Promise((resolve, reject) => {
        let allTransactions = [];
        getTransactionAsync(1, () => {
            resolve(allTransactions);
        }, (err) => {
            console.log('rejection error = ', err);
            reject(err);
        });
        async function getTransactionAsync(index, callback) {
            const StopException = {};
            try {
                console.log('index = ', index, typeof index, 'requestsCount = ', requestsCount, typeof requestsCount);
                if (index > requestsCount) {
                    throw StopException;
                }
                let url = '';
                if (type === 'btc') {
                    url = BTCurl + (50 * index);
                    console.log('url = ', url);
                } else {
                    url = BCHurl + index;
                    console.log('url = ', url);
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