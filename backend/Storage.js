var sys = require('sys'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server;

var Storage = exports;

var DB_NAME = 'uwchat',
    DB_ADDESS = '127.0.0.1',
    DB_PORT = 27017;

/**
 * Inserts document into mongodb
 * @param {String} coll_name name of the collection in the database
 * @param {Object} data an object literal to insert into the database
 */
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

/**
 * Gets the most active rooms on UWChat. Does a SQL-like GROUP BY
 * query to get the number of messages in the last half hour in each
 * existing chat room.
 * @param {String} coll_name name of the collection in the database
 * @param {Object} data an object literal to insert into the database
 */
Storage.getActiveRooms = function(coll_name, callback){
    var client = new Db(DB_NAME, new Server(DB_ADDESS, DB_PORT));
    
    var SINCE = [300000, 600000, 1800000]; //5, 10, 30 minutes
    
    client.open(function(p_client) {
        client.collection(coll_name, function(err, collection) {
            collection.group(['room'], {type: 'msg', timestamp: {$gt : new Date().getTime() - SINCE[2]}}, {sum:0}, function(doc, prev){ prev.sum += 1}, function(err, docs) {
                sys.puts('log message ' + JSON.stringify(docs) + '.');
                callback(docs);
                client.close();
            });
        });
    });
}
