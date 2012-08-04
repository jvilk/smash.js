// Imports
// =======
var stage = require('./stage.js');

// State Vars
// ==========
var state,
  moveQueue;
// Num players
var numCharacters = 1;
// World state
var gravity = -5;
var dt = 1/24;
var spawnSpacing = 50;
var spawnHeight = 10;
// Game option
var maxGroundSpeed = 50;
var maxAirJumps = 1;

// Private Helpers
// ===============
var initCharacter = function (characterId) {
  return {
    // Position
    x: characterId * spawnSpacing,
    y: spawnHeight,
    // Velocity
    v_x: 0,
    v_y: 0,
    // Acceleration
    a_x: 0,
    a_y: gravity,
    // Character area (hit box)
    height: 100,
    width: 30,
    // Character state
    onGround: true,
    airJumps: 0,
    damage: 0,
    // Vars for attacks
    reach_left: 0,
    reach_right: 0,
    reach_bottom: 0,
    reach_top: 0
  };
};

var runMove = function (characterId) {
  var character = state.characters[characterId];
  switch (moveQueue[characterId]) {
    // Basic movement
    case 'left':
      if (character.onGround) {
        character.a_x = -25;
      } else {
        character.a_x = -10;
      }
      break;
    case 'right':
      if (character.onGround) {
        character.a_x = 25;
      } else {
        character.a_x = 10;
      }
      break;
    case 'up':
      if (character.onGround) {
        character.a_y = 5;
      } else {
        if (character.airJumps <= maxAirJumps) {
          character.a_y = 3;
          character.airJumps++;
        }
      }
      break;
    case 'down':
      if (!character.onGround) {
        character.a_y = -5;
      }
      break;
    // Basic attacks
    case 'a':
      break;
    case 'up_a':
      break;
    case 'down_a':
      break;
    case 'left_a':
      break;
    case 'right_a':
      break;
    // Special moves
    // No movement
    default:
      character.a_x = 0;
      character.a_y = gravity;
      break;
  }

};

var updateCharacterMotion = function (characterId) {
  var character = state.characters[characterId];
  // Velocity calculation
  character.v_x += character.a_x * dt;
  character.v_y += character.a_y * dt;
  // Characters have a max ground velocity, no max air velocity
  if (character.onGround) {
    if (character.v_x > maxGroundSpeed) {
      character.v_x = maxGroundSpeed;
    } else if (character.v_x < -maxGroundSpeed) {
      character.v_x = -maxGroundSpeed;
    }
    // v_y cannot be negative on the ground
    if (character.v_y < 0) {
      character.v_y = 0;
    }
  }
  // Position calculation
  character.x += character.v_x * dt;
  character.y += character.v_y * dt;
};

// Public API
// ==========
module.exports = {
  // Restart the game
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
  // Update frame using latest actions
  runFrame: function () {
    // Calculate position using velocity / acceleration
    for (var i = 0; i < numCharacters; i++) {
      runMove(i);
    }
    // Attacks
    for (var i = 0; i < numCharacters; i++) {
      //detectHits(i);
    }
    // Detect collision (optional)
    // Detect ground for each char
    for (var i = 0; i < numCharacters; i++) {
      character = state.characters[i];
      // if bottom left && bottom right have collided assume ground
      if (stage.hasCollided(character.x, character.y) ||
          stage.hasCollided(character.x+character.width, character.y)) {
        state.characters[i].onGround = true;
        character.v_y = 0;
        character.a_y = 0;
      } else {
        //state.characters[i].onGround = false;
      }
    }

    for (var i = 0; i < numCharacters; i++) {
      updateCharacterMotion(i);
      moveQueue[i] = null;
    };
  },

  setMove: function (player, move) {
    moveQueue[player] = move;
  },

  get: function () {
    return state;
  },
  getSerialized: function () {
    return {
      characters: state.characters.map(function (ch) {
        return {
          x: ch.x,
          y: ch.y,
          height: ch.height,
          width: ch.width
        };
      })
    };
  },
  getConfig: function () {
    return {
      gravity: gravity,
      dt: dt,
      spawnSpacing: spawnSpacing,
      spawnHeight: spawnHeight
    }
  }
};
