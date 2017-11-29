function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}
define('btcAddress', '12v7iJGeyFau5WtdHJLgwEDQfpSi887cvj');
define('bchAddress', '1B9f1nnH8XCBNmfzRE8sxbEdWSrtv5NMnA');
define('dbHost', 'localhost');
define('dbPort', '27017');
define('dbName', 'blockchain');