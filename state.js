
// State Vars
// ==========
var state,
  moveQueue;

var numCharacters = 1;

// Private Helpers
// ===============
var initCharacter = function (characterId) {
  return {
    x: characterId * 50,
    y: 10,
    damage: 0
  };
};

var runMove = function (characterId) {
  var character = state.characters[characterId];
  switch (moveQueue[characterId]) {
    case 'left':
      character.x -= 1;
      break;
    case 'right':
      character.x += 1;
      break;
  }
  moveQueue[characterId] = null;
};

// Public API
// ==========
module.exports = {
  restart: function (newNumCharacters) {
    numCharacters = newNumCharacters;
    state = {
      characters: []
    };
    var i;
    for (i = 0; i < numCharacters; i++) {
      state.characters[i] = initCharacter(i);
    }
    moveQueue = [];
  },
  runFrame: function () {
    var i;
    for (i = 0; i < numCharacters; i++) {
      runMove(i);
    }
  },
  setMove: function (player, move) {
    moveQueue[player] = move;
  },
  get: function () {
    return state;
  }
};
