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

var resetSpots = function (num) {
  spots.length = num;
  var i;
  for (i = 0; i < num; i++) {
    spots[i] = true;
  }
};

var freeSpot = function (num) {
  spots[num] = true;
};

var playQueue = [];

var giveSomeoneMySpot = function (me) {
if (playQueue.length > 0) {
    next = playQueue.shift();
    next.id = me.id;
    me.id = false;
  } else {
    freeSpot(me.id);
  }
}

var removeMeFromTheQueue = function (me) {
  var i;
  for (i = 0; i < playQueue.length; i++) {
    if (playQueue[i] === me) {
      playQueue.splice(i, 1);
      return;
    }
  }
}

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
      name: Math.random()
    };

    if (typeof me.id !== 'number') {
      playQueue.push(me);
    }

    require('./userNames')(socket);

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
