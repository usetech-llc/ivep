$(document).ready(function() {
    window.addEventListener('load', function() {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        //var web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.100.134:8545/"));
        //web3.eth.accounts[ '0x9eEFBdF45d50ea1688540A613e5e09b7bd11896C'];
        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider
            console.log("Web3 detected!");
            window.web3 = new Web3(web3.currentProvider);
            // Now you can start your app & access web3 freely:
            startApp();
        } else {
            console.log("Web3 not detected!");
        }
    });

    function startApp() {
        // var addressOfContract = "0xf2bd69b748712531c7deb34ecc4ea935d2cc845f"; // Ropsten
        var addressOfContract = "0x101184bae6f38104a3f3936ea115240ef4de9aa4"; // main
        var contract = web3.eth.contract(abi).at(addressOfContract);
        console.log("Contract initialized successfully", contract);

        var balanceOfETH = '', balanceOfUSD = '', balanceOfFeatureTokens = '';
        var ethContainer = $('#eth-container');
        $('#tokensButton').on('click', function(e) {
            addEventListener();
        });
        getETHERUSD();
        getTotalSupplyETH();

        function getBalance(walletAddress) {
            // Get eth amount
            contract.balanceOfETH(walletAddress, function (error, data) {
                console.log('balanceOfETH = ', balanceOfETH / 10000, 'ETH');
                balanceOfETH = data["c"][0];
                var ethAmount = '<div class="result">' +
                    '<h3> У вас на счету: <span>' + (balanceOfETH / 10000) + ' ETH</span></h3>' +
                    '</div>';
                ethContainer.empty();
                ethContainer.html(ethAmount);

                contract.balanceOfFeatureTokens(walletAddress, function(error, data) {
                    balanceOfFeatureTokens = data["c"][0];
                    console.log(balanceOfFeatureTokens / 10000, 'TKLX', data);
                    var balanceContainer = ethContainer.find('h3 span');
                    var balance = balanceOfETH;
                    setTimeout(function(){
                        balanceContainer.empty();
                        balanceContainer.html((balanceOfFeatureTokens / 1000) + ' TKLX');
                        setTimeout(function(){
                            errorCatch('<h3>Проверьте другой кошелек!</h3>');
                        }, 3000);
                    }, 1000);
                });
            });
        }

        function getTKLXBalance(walletAddress) {
            // Get feature tokens amount
            contract.balanceOfFeatureTokens(walletAddress, function(error, data) {
                balanceOfFeatureTokens = data["c"][0];
                console.log(balanceOfFeatureTokens / 10000, 'TKLX', data);
            });
        }

        function getUSDBalance(walletAddress) {
            // Get feature tokens amount
            contract.balanceOfFeatureTokens(walletAddress, function(error, data) {
                balanceOfUSD = data["c"][0];
                console.log(balanceOfUSD / 10000, 'USD');
            });
        }

        function getETHERUSD() {
            // Get feature tokens amount
            contract.ETHERUSD(function(error, data) {
                //var info = data["c"][0];
                console.log('getETHERUSD = ', data);
            });
        }

        function getTotalSupplyETH() {
            // Get feature tokens amount
            contract.totalSupplyETH(function(error, data) {
                var info = data["c"][0];
                console.log('getTotalSupplyETH = ', info);
            });
        }

        function balanceOf(walletAddress) {
            // Get feature tokens amount
            contract.balanceOf(walletAddress, function(error, data) {
                //balanceOfUSD = data["c"][0];
                console.log('balanceOf = ', data);
            });
        }

        function addEventListener() {
            var walletAddress = $('#tokens').val();
            if (!walletAddress) {
                errorCatch('<h3>Введите номер вашего кошелька!</h3>');
                return;
            }
            if (!isAddress(walletAddress)) {
                errorCatch('<h3>Адрес кошелька не валиден!</h3>');
                return;
            }
            getBalance(walletAddress);
        }

        function errorCatch(text) {
            var errorMessage = text;
            ethContainer.empty();
            ethContainer.html(errorMessage);
            setTimeout(function(){
                var formText = '<div class="check-tokens-form form-inline">' +
                    '<div class="form-group">' +
                    '<label class="sr-only" for="tokens">Адрес вашего кошелька</label>' +
                    '<input id="tokens" type="text" class="form-control token-field" placeholder="Enter your wallet address" name="tokens" required="" aria-required="true"> ' +
                    '<button id="tokensButton" class="btn btn-primary">Проверить токены</button>' +
                    '</div>' +
                    '</div>';
                ethContainer.empty();
                ethContainer.html(formText);
                $('#tokensButton').on('click', function(e) {
                    addEventListener();
                });
            }, 2000);
        }

        /**
         * Checks if the given string is an address
         *
         * @method isAddress
         * @param {String} address the given HEX adress
         * @return {Boolean}
         */
        var isAddress = function (address) {
            if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
                // check if it has the basic requirements of an address
                return false;
            } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
                // If it's all small caps or all all caps, return true
                return true;
            } else {
                // Otherwise check each case
                return true;
            }
        };

        /**
         * Checks if the given string is a checksummed address
         *
         * @method isChecksumAddress
         * @param {String} address the given HEX adress
         * @return {Boolean}
         */
        var isChecksumAddress = function (address) {
            // Check each case
            address = address.replace('0x','');
            var addressHash = sha3(address.toLowerCase());
            for (var i = 0; i < 40; i++ ) {
                // the nth letter should be uppercase if the nth digit of casemap is 1
                if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                    return false;
                }
            }
            return true;
        };
    }

});