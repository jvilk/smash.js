
// State Vars
// ==========
var state,
  moveQueue;

var numCharacters = 1;
var max_ground_x = 50;
var max_ground_y = 50;
var gravity = -5;
var max_air_jumps = 1;

// Private Helpers
// ===============
var initCharacter = function (characterId) {
  return {
    x: characterId * 50,
    y: 10,
    v_x: 0,
    v_y: 0,
    a_x: 0,
    a_y: 0,
    onGround: true,
    airJumps: 0,
    damage: 0
  };
};

var runMove = function (characterId) {
  var character = state.characters[characterId];
  switch (moveQueue[characterId]) {
    case 'none':
      character.a_x = 0;
      character.a_y = gravity;
      break;
    // Basic movement
    case 'left':
      if (character.onGround) {
        character.a_x = -5;
      } else {
        character.a_x = -3;
      }
      break;
    case 'right':
      if (character.onGround) {
        character.a_x = 5;
      } else {
        character.a_x = 3;
      }
      break;
    case 'up':
      if (character.onGround) {
        character.a_y = 5;
      } else {
        if character.airJumps<=max_air_jumps{
          character.a_y = 3;
          character.airJumps++;
        }
      }
      break;
    case 'down':
      if (character.onGround) {
        character.a_y = -5;
      } else {
        character.a_y = -3;
      }
      break;
    // Basic attacks
    case 'a':
    case 'up_a':
    case 'down_a':
    case 'left_a':
    case 'right_a':
    // Special moves
  }

  var updateCharacterMotion = function (characterId) {
    var character = state.characters[characterId];
    var dt = 1/24;
    // Velocity calculation
    //Characters have a max ground velocity, no max air velocity
    if (character.onGround) {
      character.v_x = min(max_ground_x, character.v_x + character.a_x * dt);
      character.v_y = max(0, min(max_ground_y, character.v_y + character.a_y * dt));
    } else {
      character.v_x += character.a_x * dt;
      character.v_y += character.a_y * dt;
    }
    // Position calculation
    character.x += character.v_x * dt;
    character.y += character.v_y * dt;
  }
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
    // Calculate position using velocity / acceleration
    for (var i = numCharacters; i++) {
      updateCharacterMotion(i);
    }
    // Attacks
    for (var i = numCharacters; i++) {
      //attacks(i);
      //detectHits(i);
    }
    // Detect collision (optional)
    // Detect ground for each char
  },
  setMove: function (player, move) {
    moveQueue[player] = move;
  },
  get: function () {
    return state;
  }
};
