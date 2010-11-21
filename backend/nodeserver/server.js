HOST = null; // localhost
PORT = 8001;

// when the daemon started
var starttime = (new Date()).getTime();

var mem = process.memoryUsage();
// every 10 seconds poll for the memory.
setInterval(function () {
  mem = process.memoryUsage();
}, 10*1000);


var fu = require("../../common/fu"),
    sys = require("sys"),
    url = require("url"),
    qs = require("querystring");

var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

var Breeze = {
  arrg : function (iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  }
};

Breeze.Util = {};

/**
 * Create an array filled with the given object.
 *
 * @param {number} numberOfItems
 * @param {Object=} opt_value     Default: 0
 * @return {Array.<Object>}
 */
Breeze.Util.filledArray = function(numberOfItems, opt_value) {
  opt_value = opt_value || 0;
  var array = [];
  for (var ix = 0; ix < numberOfItems; ++ix) {
    array.push(opt_value);
  }
  return array;
};

/**
 * Prototype-based Object extensions.
 */
Object.extend = function(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
};

Object.extend(Function.prototype, {
  isUndefined: function(object) {
    return typeof object == "undefined";
  },

  /**
   * Set a method invocation's "this" scope.
   *
   * Example: When passing a callback.
   *          callback : myobject.onCallback.bind(myobject)
   *          This will ensure that within the onCallback method, "this" refers to "myobject".
   */
  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = Breeze.arrg(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat(Breeze.arrg(arguments)));
    }
  }
});

var ChatJS = {};

ChatJS.Channel = function () {
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


// [room_name] => array(sessions)
var rooms = {};
var sessions = {};

function joinRoom (room_name, nick) {
  if (room_name.length > 50) return null;
  if (/[^\w_\-^!]/.exec(room_name)) return null;
  if (nick.length > 50) return null;
  if (/[^\w_\-^!]/.exec(nick)) return null;

  // Does the room exist?
  if (typeof rooms[room_name] == 'undefined') {
    // No. Create it.
    
    sys.puts('Creating a room: '+room_name);

    var channel = new ChatJS.Channel();

    var room = { 
      room_name: room_name,
      channel: channel,
      sessions: []
    };

    rooms[room_name] = room;
  }

  // Is the user already in the room?
  if (!rooms[room_name].sessions[nick]) {
    // No, join the room.
    rooms[room_name].sessions[nick] = createSession(nick, rooms[room_name].channel);

  } else {
    return null;
  }

  return rooms[room_name];
}

function createSession (nick, channel) {
  // TODO: name length
  if (nick.length > 50) return null;
  if (/[^\w_\-^!]/.exec(nick)) return null;

  for (var i in sessions) {
    var session = sessions[i];
    if (session && session.nick === nick) return null;
  }

  var session = { 
    nick: nick, 
    timestamp: new Date(),

    poke: function () {
      session.timestamp = new Date();
    },

    destroy: function () {
      channel.appendMessage(session.nick, "part");
      delete sessions[session.nick];
    }
  };

  sessions[session.nick] = session;
  return session;
}

// interval to kill off old sessions
setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];

    if (now - session.timestamp > SESSION_TIMEOUT) {
      session.destroy();
    }
  }
}, 1000);

fu.listen(Number(process.env.PORT || PORT), HOST);

fu.get("/", fu.staticHandler("frontend/client/www/index.html"));
fu.get("/style.css", fu.staticHandler("frontend/client/www/style.css"));
fu.get("/client.js", fu.staticHandler("frontend/client/www/client.js"));
fu.get("/jquery.js", fu.staticHandler("frontend/client/www/jquery.js"));


fu.get("/who", function (req, res) {
  sys.puts('serv: who');
  sys.puts(' - req: '+req);
  sys.puts(' - res: '+res);
  var room_name = qs.parse(url.parse(req.url).query).room;
  var nicks = [];
  for (var id in rooms[room_name].sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    nicks.push(session.nick);
  }
  res.simpleJSON(200, { nicks: nicks
                      , rss: mem.rss
                      });
});

fu.get("/join", function (req, res) {
  sys.puts('serv: join');
  sys.puts(' - req: '+req.url);
  sys.puts(' - query: '+url.parse(req.url).query);
  sys.puts(' - res: '+res);
  
  // Gets the room name from the URL (a GET request).
  var room_name = qs.parse(url.parse(req.url).query).room;
  if (room_name == null || room_name.length == 0) {
    res.simpleJSON(400, {error: "Bad room name."});
    return;
  }

  // TODO: Something more fun.
  var user_name = 'anon'+Math.floor(Math.random()*1000000000000);
  var room = joinRoom(room_name, user_name);
  if (room == null) {
    res.simpleJSON(400, {error: "There's already a user with your name in the room."});
    return;
  }

  sys.puts("connection: " + room_name + "@" + res.connection.remoteAddress);

  room.channel.appendMessage(user_name, "join");
  res.simpleJSON(200, { nick: user_name
                      , room: room_name
                      , rss: mem.rss
                      , starttime: starttime
                      });
});

fu.get("/part", function (req, res) {
  sys.puts('serv: part');
  sys.puts(' - req: '+req);
  sys.puts(' - res: '+res);
  var id = qs.parse(url.parse(req.url).query).nick;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.destroy();
  }
  res.simpleJSON(200, { rss: mem.rss });
});

fu.get("/recv", function (req, res) {
  sys.puts('serv: recv');
  sys.puts(' - req: '+req);
  sys.puts(' - res: '+res);
  if (!qs.parse(url.parse(req.url).query).since) {
    res.simpleJSON(400, { error: "Must supply since parameter" });
    return;
  }
  var id = qs.parse(url.parse(req.url).query).nick;
  var room_name = qs.parse(url.parse(req.url).query).room;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.poke();
  }

  var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);

  sys.puts(room_name);

  var room = rooms[room_name];
  room.channel.query(since, function (messages) {
    if (session) session.poke();
    res.simpleJSON(200, { messages: messages, rss: mem.rss });
  });
});

fu.get("/send", function (req, res) {
  sys.puts('serv: send');
  sys.puts(' - req: '+req);
  sys.puts(' - res: '+res);
  var id = qs.parse(url.parse(req.url).query).nick;
  var room_name = qs.parse(url.parse(req.url).query).room;
  var text = qs.parse(url.parse(req.url).query).text;

  sys.puts(id);

  var session = sessions[id];
  if (!session || !text) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }

  session.poke();

  var room = rooms[room_name];
  room.channel.appendMessage(session.nick, "msg", text);
  res.simpleJSON(200, { rss: mem.rss });
});
