var sys = require('sys'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var Storage = exports;

var DB_NAME = 'uwchat',
    DB_ADDESS = '127.0.0.1',
    DB_PORT = 27017;

Storage.save = function(coll_name, data) {
  var client = new Db(DB_NAME, new Server(DB_ADDESS, DB_PORT));

  client.open(function(p_client) {
    client.collection(coll_name, function(err, collection) {
      collection.insert(data, function(err, docs) {
        sys.puts('log message ' + JSON.stringify(data) + '.');
        client.close();
      });
    });
  });
}
