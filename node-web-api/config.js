function define(name, value) {
  Object.defineProperty(exports, name, {
    value:      value,
    enumerable: true
  });
}

define('dbHost', 'localhost');
define('dbPort', '27017');
define('dbName', 'ivep');
define('applicationPort', '8081');