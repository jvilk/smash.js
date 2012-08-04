/*
 * Serve content over a socket
 */

// imports
// =======
var state = require('../state');

// make sockets API available within this module; registered at init time
var sockets;

// max players playing in a game
var numPlayers = 4;

// keep track of which characters are free (which "spots" are free)
var spots = [];
var getSpot = function () {
  for (i = 0; i < numPlayers; i++) {
    if (spots[i]) {
      spots[i] = false;
      return i;
    }
  }
  return false;
};

var characterToPlayer = [];
characterToPlayer.length = numPlayers;

var sendPlayers = function () {
  sockets.emit('send:players', {
    players: characterToPlayer,
    queue: playQueue
  });
}

var resetSpots = function (num) {
  spots.length = num;
  var i;
  for (i = 0; i < num; i++) {
    spots[i] = true;
  }
};

var freeSpot = function (num) {
  spots[num] = true;
  characterToPlayer[num] = null;
  sendPlayers();
};

var playQueue = [];

var giveSomeoneMySpot = function (me) {
  if (playQueue.length > 0) {
    next = playQueue.shift();
    next.id = me.id;
    me.id = false;
    characterToPlayer[next.id] = next.data;
  } else {
    freeSpot(me.id);
  }
  sendPlayers();
}

var removeMeFromTheQueue = function (me) {
  var i;
  for (i = 0; i < playQueue.length; i++) {
    if (playQueue[i] === me) {
      playQueue.splice(i, 1);
      return;
    }
  }
  sendPlayers();
}

// Registering user name
// =====================
// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

module.exports = {
  init: function (s) {
    sockets = s;
    resetSpots(numPlayers);
    state.restart(numPlayers);
    setInterval(function () {
      state.runFrame();
      sockets.emit('send:state', state.getSerialized());
    }, 30);
  },
  connect: function (socket) {
    var me = {
      id: getSpot(),
      data: {
        name: userNames.getGuestName()
      }
    };

    // send the new user their name and a list of users
    socket.emit('init', {
      name: me.data.name,
      users: userNames.get()
    });

    // notify other clients that a new user has joined
    socket.broadcast.emit('user:join', {
      name: me.data.name
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
      if (userNames.claim(data.name)) {
        var oldName = me.data.name;
        userNames.free(oldName);

        me.data.name = data.name;
        
        socket.broadcast.emit('change:name', {
          oldName: oldName,
          newName: me.data.name
        });

        sendPlayers();

        fn(true);
      } else {
        fn(false);
      }
    });

    if (typeof me.id !== 'number') {
      playQueue.push(me);
    } else {
      characterToPlayer[me.id] = me.data;
    }
    sendPlayers();

    socket.on('submit:move', function (move) {
      if (typeof me.id === 'number') {
        state.setMove(me.id, move);
      }
    });

    socket.on('disconnect', function () {
      if (typeof me.id === 'number') {
        giveSomeoneMySpot(me);
      } else {
        removeMeFromTheQueue(me);
      }
      state.removeOnDie(deathListener);

      // clean up when a user leaves, and broadcast it to other users
      socket.broadcast.emit('user:left', {
        name: me.data.name
      });
      userNames.free(me.data.name);
    });

    function deathListener (playerId) {
      var next;
      if (playerId === me.id) {
        if (playQueue.length > 0) {
          giveSomeoneMySpot(me);
          playQueue.push(me);
        } else {
          freeSpot(me.id);
        }
        return true;
      } else {
        return false;
      }
    }

    state.onDie(deathListener);
  }
};
