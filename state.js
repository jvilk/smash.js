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
var gravity = 3;
var dt = 1/24;
var spawnSpacing = 50;
var spawnHeight = 10;
// Game option
var maxGroundSpeed = 100;
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

var stageHeight = 390;

var fps = 5;

// Private Helpers
// ===============
var initCharacter = function (characterId) {
  return {
    // Position
    x: characterId * spawnSpacing + 500,
    y: spawnHeight,
    // Direction facing
    facing: 'left',
    // Velocity
    v_x: 0,
    v_y: 0,
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

    // vars for animation
    frame: 0,
    action: 'stand',

    // state variables
    attackFrames: 0,
    damageFrames: 0,
    invulFrames: 0,
    jumps: 2,
    jumpTimeout: 0
  };
};

var attack = function (character) {
  console.log(character);
}

var moveLeft = function (character) {
  if (character.onGround) {
    character.v_x = -75;
  } else {
    character.v_x = -50;
  }
  character.action = 'run';
  character.facing = 'left';
};

var moveRight = function (character) {
  if (character.onGround) {
    character.v_x = 75;
  } else {
    character.v_x = 50;
  }
  character.action = 'run';
  character.facing = 'right';
};

var moveUp = function (character) {
  if (character.jumps > 0 && character.jumpTimeout <= 0) {
    character.onGround = false;
    character.jumps -= 1;
    character.jumpTimeout = 20;
    if (character.onGround) {
      character.v_y = -200;
    } else {
      character.v_y -= 100;
    }
  }
};

var moveDown = function (character) {
  if (!character.onGround) {
    character.v_y += gravity * 2;
  }
};

var canMove = function (character) {
  return character.damageFrames <= 0 && character.attackFrames <= 0;
}

var runMove = function (characterId) {
  var character = state.characters[characterId];
  if (canMove(character)) {
    switch (moveQueue[characterId]) {
      // Basic movement
      case 'left':
        moveLeft(character);
        break;
      case 'right':
        moveRight(character);
        break;
      case 'leftUp':
        moveLeft(character);
        moveUp(character);
        break;
      case 'rightUp':
        moveRight(character);
        moveUp(character);
        break;
      case 'leftDown':
        moveLeft(character);
        moveDown(character);
        break;
      case 'rightDown':
        moveRight(character);
        moveDown(character);
        break;
      case 'up':
        moveUp(character);
        break;
      case 'down':
        moveDown(character);
        break;
      case 'attack':
        attack(character);
        break;
      // Basic attacks
      // Special moves
      // No movement
      default:
        character.v_x = 0;
        character.action = 'stand';
        break;
    }
  }

  // check for collision w\ stage
  // TODO: find dimensions of stage on map
  if (character.y > stageHeight && character.x > 200 && character.x < 1010) {
    character.y = stageHeight;
    character.onGround = true;
    character.jumps = 2;
    character.jumpTimeout = 0;
    character.v_y = 0;
  }

  // add gravity if not on the ground
  if (!character.onGround) {
    character.v_y += gravity;
    if (character.jumpTimeout > 0) {
      character.jumpTimeout -= 1;
    }
  } else if(character.x < 200 || character.x > 1010) {
    character.onGround = false;
  }



  if (character.attackFrames > 0) {
    character.attackFrames -= 1;
    if (attackFrames === 0) {
      character.reach_left = 0;
      character.reach_right = 0;
      character.reach_bottom = 0;
      character.reach_top = 0;
    }
  }

  if (character.damageFrames > 0) {
    character.damageFrames -= 1;
  }

  // Position calculation
  character.x += character.v_x * dt;
  character.y += character.v_y * dt;

  // animate
  character.frame += 1;
  if (character.frame >= 4 * fps) {
    character.frame = 0;
  }
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
    /*
    for (var i = 0; i < numCharacters; i++) {
      character = state.characters[i];
      // if bottom left && bottom right have collided assume ground
      if (stage.hasCollided(character.x, character.y) ||
          stage.hasCollided(character.x+character.width, character.y)) {
        state.characters[i].onGround = true;
        character.v_y = 0;
      } else {
        //state.characters[i].onGround = false;
      }
    }
    */

    for (var i = 0; i < numCharacters; i++) {
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

          frame: Math.floor(ch.frame / fps),
          action: ch.action,

          facing: ch.facing
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
