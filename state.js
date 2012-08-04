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
var gravity = 0;
var dt = 1/24;
var spawnSpacing = 50;
var spawnHeight = 10;
// Game option
var maxGroundSpeed = 50;
var maxAirJumps = 1;
// Attack reaches
var groundNeutralReach = 10;
var aerialNeutralReach = 12;
var groundSideReach = 15;
var aerialFrontReach = 15;
var aerialRearReach = 12;
var groundUpReach = 10;
var aerialUpReach = 15;
var groundDownReach = 8;
var aerialDownReach = 10;

// Private Helpers
// ===============
var initCharacter = function (characterId) {
  return {
    // Position
    x: characterId * spawnSpacing,
    y: spawnHeight,
    // Direction facing
    facing: 'left',
    // Velocity
    v_x: 0,
    v_y: 0,
    // Acceleration
    a_x: 0,
    a_y: gravity,
    // Character area (hit box)
    height: 100,
    width: 30,
    // TODO Character state
    // state: 'stun',
    onGround: false,
    airJumps: 0,
    damage: 0,
    // Vars for attacks
    reach_left: 0,
    reach_right: 0,
    reach_bottom: 0,
    reach_top: 0,
    frame: 0,
    action: 'stand'
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
        character.a_y = -5;
      } else {
        if (character.airJumps <= maxAirJumps) {
          character.a_y = -3;
          character.airJumps++;
        }
        else{
          character.a_x = 0;
          character.a_y = gravity;
        }
      }
      break;
    case 'down':
      if (!character.onGround) {
        character.a_y = 10;
      }
      break;
    // Basic attacks
    case 'a':
      if (character.onGround) {
        if (charcter.facing === 'left') {
          character.reach_left = 10;
        } else if (charcter.facing === 'right') {
          character.reach_right = 10;
        } else {
          throw new Error('where are you facing?');
        }
      } else {
        if (charcter.facing === 'left') {
          character.reach_left = 8;
        } else if (charcter.facing === 'right') {
          character.reach_right = 8;
        } else {
          throw new Error('where are you facing?');
        }
      }
      break;
    case 'up_a':
      if (character.onGround) {
        character.reach_top = 10;
      } else {
        character.reach_top = 15;
      }
      break;
    case 'down_a':
      if (character.onGround) {
        character.reach_left = 5;
        character.reach_right = 5;
      } else {
        character.reach_bottom = 10;
      }
      break;
    case 'left_a':
      if (character.onGround) {
        if (charcter.facing === 'left') {
          character.reach_left = 15;
        } else if (charcter.facing === 'right') {
          character.reach_left = 12;
        } else {
          throw new Error('where are you facing?');
        }
        character.reach_left = 15;
      } else {
        character.reach_left = 12;
      }
      break;
    case 'right_a':
      if (character.onGround) {
        character.reach_right = 15;
      } else {
        
      }
      break;
    // Special moves
    // No movement
    default:
      character.a_x = 0;
      character.a_y = gravity;
      character.frame += 1;
      if (character.frame >= 4) {
        character.frame = 0;
      }
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
    if (character.v_y > 0) {
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
    // Process moves
    for (var i = 0; i < numCharacters; i++) {
      runMove(i);
    }
    // Process hits
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
          width: ch.width,

          frame: ch.frame,
          action: ch.action
        };
      })
    };
  },
  getConfig: function () {
    return {
      gravity: gravity,
      dt: dt,
      spawnSpacing: spawnSpacing,
      spawnHeight: spawnHeight,
      maxGroundSpeed: maxGroundSpeed,
      maxAirJumps : maxAirJumps
    }
  }
};
