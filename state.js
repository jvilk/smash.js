// Imports
// =======
var stage = require('./stage.js');
var _ = require('underscore');

Number.prototype.between = function(first,last){
    return (first < last ? this >= first && this <= last : this >= last && this <= first);
}

function randOrd(){
return (Math.round(Math.random())-0.5); }


// State Vars
// ==========
var state,
  moveQueue;
// Num players
var numCharacters = 1;
// World state
var gravity = 3;
var dt = 1/16;
var spawnSpacing = 50;
var spawnHeight = 10;
// Game option
var mapWidth = 1280;
var mapHeight = 720;
var deathMargin = 200;

var stageHeight = 390;

//these numbers are random guesses and subject to change
var stageLeft = 1010;
var stageRight = 260;

var fps = 3;

var neutralGroundAttackHitSpeed = 10;
var neutralAirAttackHitSpeed = 19;
var sideGroundAttackHitSpeed = 17;
var airRearAttackHitSpeed = 25;
var airFrontAttackHitSpeed = 18;

var neutralAttackFrames = 20;
// Private Helpers
// ===============

var characterArray = {}

var initCharacters = function(){
  return [
    characterArray.link = {
      height : 100,
      width : 30,
      maxAirJumps : 2,
      groundNeutralReach : 10,
      aerialNeutralReach : 12,
      groundSideReach : 15,
      aerialFrontReach : 15,
      aerialRearReach : 12,
      groundUpReach : 10,
      aerialUpReach : 15,
      groundDownReach : 8,
      aerialDownReach : 10,
      neutralGroundAttackHitSpeed: 10,
      neutralAirAttackHitSpeed: 19,
      sideGroundAttackHitSpeed: 17,
      airRearAttackHitSpeed: 25,
      airFrontAttackHitSpeed: 18,
      neutralAttackFrames: 20,
    },
    characterArray.kirby = {
      height : 100,
      width : 30,
      maxAirJumps : 10,
      groundNeutralReach : 10,
      aerialNeutralReach : 12,
      groundSideReach : 15,
      aerialFrontReach : 15,
      aerialRearReach : 12,
      groundUpReach : 10,
      aerialUpReach : 15,
      groundDownReach : 8,
      aerialDownReach : 10,
      neutralGroundAttackHitSpeed: 10,
      neutralAirAttackHitSpeed: 19,
      sideGroundAttackHitSpeed: 17,
      airRearAttackHitSpeed: 25,
      airFrontAttackHitSpeed: 18,
      neutralAttackFrames: 20,
    },
    characterArray.captainfalcon = {
      height : 100,
      width : 30,
      maxAirJumps : 1,
      groundNeutralReach : 10,
      aerialNeutralReach : 12,
      groundSideReach : 15,
      aerialFrontReach : 15,
      aerialRearReach : 12,
      groundUpReach : 10,
      aerialUpReach : 15,
      groundDownReach : 8,
      aerialDownReach : 10,
      neutralGroundAttackHitSpeed: 10,
      neutralAirAttackHitSpeed: 19,
      sideGroundAttackHitSpeed: 17,
      airRearAttackHitSpeed: 25,
      airFrontAttackHitSpeed: 18,
      neutralAttackFrames: 20,
    }
  ];
}




var initCharacter = function (characterId) {
  var characters = initCharacters();
  var character = characters[characterId % characters.length];
  var state = {
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
    jumps: character.maxAirJumps,
    jumpTimeout: 0
  };
  console.log(state);
  return _.extend(state, character);
};
var leftAttack = function (character){
  character.attackFrames = 20;
  if(character.onGround){
    character.facing = 'left';
    character.reach_left = character.groundSideReach;
  }
  else{
    if (character.facing === 'left'){
      character.reach_left = character.aerialFrontReach;
    }
    else{
      character.reach_left = characters.aerialRearReach;
    }
  }
}

var rightAttack = function (character){
  var characters = state.characters;
  character.attackFrames = 20;
  if(character.onGround){
    character.facing = 'right';
    character.reach_right = character.groundSideReach;
    character.action = 'rightGroundAttack';
  }
  else{
    if (character.facing === 'right'){
      character.reach_right = character.aerialFrontReach;
      character.action = 'rightAerialFrontAttack';
    }
    else{
      character.reach_right = characters.aerialRearReach;
      character.action = 'rightAerialRearAttack';
    }
  }
  for (var i = characters.length - 1; i >= 0; i--) {
    rightAttackCollision(character, characters[i]);
  }
}

var neutralAttack = function (character) {
  var characters = state.characters;
  character.attackFrames = neutralAttackFrames;
  if (character.onGround){
    if (character.facing === 'right'){
      character.reach_right = character.groundNeutralReach;
    }
    if (character.facing === 'left'){
      character.reach_left = character.groundNeutralReach;
    }
  } else {
    if (character.facing === 'right'){
      character.reach_right = character.aerialNeutralReach;
    }
    if (character.facing === 'left'){
      character.reach_left = character.aerialNeutralReach;
    }

  }
  var charAttackOrder = []
  for (var i = characters.length - 1; i >= 0; i--) {
    charAttackOrder.push(i);
  }
  charAttackOrder.sort(randOrd);
  for (var i = characters.length - 1; i >= 0; i--) {  
    if (character !== characters[charAttackOrder[i]]) {
      neutralAttackCollision(character, characters[charAttackOrder[i]]);
    }
  }
  character.action = 'attack';
};

var neutralAttackCollision = function(attacker, victim) {
  //console.log(attacker, victim);
  if (attacker.y.between(victim.y, victim.y + victim.height) || (attacker.y + attacker.height).between(victim.y, victim.y + victim.height)) {
    var dir = 0;
    if ((attacker.facing === 'left') && (victim.x+victim.width).between(attacker.x-attacker.reach_left, attacker.x+attacker.width)){
      dir = -1;
    }
    if ((attacker.facing === 'right') && (victim.x).between(attacker.x, attacker.x+attacker.width+attacker.reach_right)){
      dir = 1;
    }
    if (dir !== 0) {
      victim.damage += Math.round(Math.random()*10)
      victim.airJumps = 0;
      victim.damage += 100;
      dir = dir * (1 + victim.damage/100);
      if (attacker.onGround) {
        victim.damage += 10;
        victim.v_x += dir * attacker.neutralGroundAttackHitSpeed;
      } else{
        victim.v_x += dir * attacker.neutralAirAttackHitSpeed;
      }
      victim.state = 'stun';
      victim.onGround = false;
      victim.v_y = -80 * (1+victim.damage/500);
      victim.damageFrames = 50+victim.damage/20;
      //console.log(victim)
    }
  }
};

var leftAttackCollision = function(attacker, victim){
  if (attacker.y.between(victim.y, victim.y+victim.height) || (attacker.y+attacker.height).between(victim.y, victim.y+victim.height)){
    var dir = 0;
    if ((victim.x+victim.width).between(attacker.x-attacker.reach_left, attacker.x+attacker.width)){
      var dir = -1;
      if(attacker.onGround){
        victim.v_x+= dir * attacker.leftGroundAttackHitSpeed;
      } else {
        if (attacker.facing === 'left'){
          victim.v_x += dir * attacker.airFrontAttackHitSpeed;
        }
        if (attacker.facing === 'right'){
          victim.v_x += dir * attacker.airRearAttackHitSpeed;
        }
      }
    }
  }
}

var rightAttackCollision = function(attacker, victim){
  if (attacker.y.between(victim.y, victim.y+victim.height) || (attacker.y+attacker.height).between(victim.y, victim.y+victim.height)){
    var dir = 0;
    if (victim.x.between(attacker.x, attacker.x+attacker.width+attacker.reach_right)){
      dir = 1;
      if(attacker.onGround){
        victim.v_x+= dir * attacker.leftGroundAttackHitSpeed;
      }
    
      else{
        if (attacker.facing === 'left'){
          victim.v_x += dir * attacker.airFrontAttackHitSpeed;
        }
        if (attacker.facing === 'right'){
          victim.v_x += dir * attacker.airRearAttackHitSpeed;
        }
      }
    }
  }
}

var upAttackCollision = function(attacker, victim){

}

var downAttackCollision = function(attacker, victim){

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
      character.v_y = -120;
    } else {
      character.v_y = -80;
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

var isDead = function (character) {
  return character.x <= -deathMargin ||
    character.x > mapWidth + deathMargin ||
    character.y < -deathMargin ||
    character.y > mapHeight + deathMargin;
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
        neutralAttack(character);
        break;
      case 'leftAttack':
        leftAttack(character);
        break;
      case 'rightAttack':
        rightAttack(character);
        break;
      case 'downAttack':
        downAttack(character);
        break;
      case 'upAttack':
        upAttack(character);
        break;
      // Basic attacks
      // Special moves
      // No movement
      default:
        character.v_x = character.v_x / 3;
        if (character.v_x < 0) {
          character.v_x = Math.ceil(character.v_x);
        } else {
          character.v_x = Math.floor(character.v_x);
        }
        if (character.v_x === 0) {
          character.action = 'stand';
        }
        break;
    }
  } else if (character.damageFrames > 0) {
    character.action = 'stun';
    character.frame = 0;
  }

  // check for collision w\ stage
  if (character.y > stageHeight && (character.y - character.v_y*6*dt) < stageHeight && character.x > stageRight && character.x < stageLeft) {
    character.y = stageHeight;
    character.onGround = true;
    character.jumps = character.maxAirJumps;
    character.jumpTimeout = 0;
    character.v_y = 0;
  }

  // add gravity if not on the ground
  if (!character.onGround) {
    character.v_y += gravity;
    if (character.jumpTimeout > 0) {
      character.jumpTimeout -= 1;
    }
  } else if(character.x < stageRight || character.x > stageLeft) {
    character.onGround = false;
  }



  if (character.attackFrames > 0) {
    character.attackFrames -= 1;
    if (character.attackFrames === 0) {
      character.reach_left = 0;
      character.reach_right = 0;
      character.reach_bottom = 0;
      character.reach_top = 0;
    }
  }

  if (character.damageFrames > 0) {
    character.damageFrames -= 1;
    if (character.damageFrames === 0) {
      character.action = 'stand'
    }
  }

  // Position calculation
  character.x += character.v_x * dt;
  character.y += character.v_y * dt;

  if (isDead(character)) {
    state.characters[characterId] = initCharacter(characterId);
    var i, fn;
    for (i = 0; i < deathHook.length; i++) {
      fn = deathHook[i]
      if (fn(characterId)) {
        break;
      }
    }
  }

  // animate
  if (character.damageFrames <= 0) {
    character.frame += 1;
    if (character.frame >= 4 * fps) {
      character.frame = 0;
    }
  }
};

// noop by default
var deathHook = [];

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

          facing: ch.facing,
          damage: ch.damage
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
  },
  onDie: function (fn) {
    deathHook.push(fn);
  },
  removeOnDie: function (fn) {
    var i;
    for (i = 0; i < deathHook.length; i++) {
      if (deathHook[i] === fn) {
        deathHook.splice(i, 1);
        return;
      }
    }
  }
};
