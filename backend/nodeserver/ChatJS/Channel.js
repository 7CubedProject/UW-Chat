
ChatJS = exports;

var sys = require("sys"),
    storage = require('../Storage.js');

var MESSAGE_BACKLOG = 200;

ChatJS.Channel = function (name) {
  this.name = name;
  this.messages = [];
  this.callbacks = [];

  setInterval(function () {
    var now = new Date();
    while (this.callbacks.length > 0 && now - this.callbacks[0].timestamp > 30*1000) {
      this.callbacks.shift().callback([]);
    }
  }.bind(this), 3000);
};

ChatJS.Channel.prototype.appendMessage = function (nick, type, text) {
  var m = { type: type // "msg", "join", "part"
          , text: text
          , timestamp: (new Date()).getTime()
          };

  if (nick) {
    m.nick = nick;
  }

  switch (type) {
    case "msg":
      sys.puts("<" + nick + "> " + text);
      break;
    case "join":
      sys.puts(nick + " join");
      break;
    case "part":
      sys.puts(nick + " part");
      break;
  }

  this.messages.push( m );

  // log into mongodb
  m.room = this.name;
  storage.save('messages', m);

  while (this.callbacks.length > 0) {
    this.callbacks.shift().callback([m]);
  }

  while (this.messages.length > MESSAGE_BACKLOG) {
    this.messages.shift();
  }
};

ChatJS.Channel.prototype.query = function (since, callback) {
  var matching = [];
  // Find the messages that have been created after the "since" timestamp.
  for (var i = 0; i < this.messages.length; i++) {
    var message = this.messages[i];
    if (message.timestamp > since) {
      matching.push(message);
    }
  }

  // We now have an array of messages to send off to the callback.

  if (matching.length != 0) {
    // We have matching messages.
    callback(matching);

  } else {
    this.callbacks.push({ timestamp: new Date(), callback: callback });
  }
};
