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

module.exports = {
  init: function (s) {
    sockets = s;
    resetSpots(numPlayers);
    state.restart(numPlayers);
    setInterval(function () {
      state.runFrame();
      sockets.emit('send:state', state.get());
    }, 30);
  },
  connect: function (socket) {
    var myId = getSpot();

    if (typeof myId === 'number') {
      socket.on('submit:move', function (move) {
        // assume the move is legit
        state.setMove(myId, move);
      });
    }

    socket.on('disconnect', function () {
      if (typeof myId === 'number') {
        freeSpot(myId);
      }
    });
  }
};
