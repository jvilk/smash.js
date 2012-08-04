/*
 * Serve content over a socket
 */

var state = require('../state');

var nextPlayer,
  sockets;

module.exports = {
  init: function (s) {
    sockets = s;
    nextPlayer = 0;
    state.restart(4);
    setInterval(function () {
      state.runFrame();
      sockets.emit('send:state', state.get());
    }, 30);
  },
  connect: function (socket) {

    var myId = nextPlayer;
    nextPlayer += 1;
    socket.on('submit:move', function (move) {
      // assume the move is legit
      state.setMove(myId, move);
    });
  }
};
