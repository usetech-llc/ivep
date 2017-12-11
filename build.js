const fs = require("fs");
const solc = require('solc');
var Web3 = require('web3');
//var w3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io'));
var w3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
//var w3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8101'));

// Compile source file from cmd line argument
var sourceFile = process.argv[2];
var contractName = process.argv[3];
console.log("Compiling " + contractName + " contract from solidity file " + sourceFile + " ...");
var source = fs.readFileSync(sourceFile, 'utf8');
var cc = solc.compile(source);

//console.log("cc = " + Object.keys(cc.contracts));

var bytecode = '0x' + cc.contracts[':' + contractName].bytecode;
var abi = cc.contracts[':' + contractName].interface;
//w3.eth.estimateGas({data: bytecode}).then(gasEstimate => {
//    console.log("Deployment gas estimate: " + gasEstimate + "\n")
//});

fs.writeFile("build/" + contractName + ".bytecode", bytecode, function(err) {
    if(err) {
        return console.log(err);
    }
});
fs.writeFile("build/" + contractName + ".abi", abi, function(err) {
    if(err) {
        return console.log(err);
    }
});
