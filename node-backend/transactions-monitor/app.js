const config = require('./config');
var bc = require('./blockchain-api');


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
        await DownloadLTC();

    } catch (error) {
        console.log("Exception: ", error);
    }

    console.log("Happy path output");
}

main();
