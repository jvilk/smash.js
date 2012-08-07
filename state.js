// Imports
// =======
var stage = require('./stage.js');
var _ = require('underscore');
var playerstate = require('./playerstate.js');
var characters = require('./characters');

Number.prototype.between = function(first,last){
    return (first < last ? this >= first && this <= last : this >= last && this <= first);
};

function randOrd(){
  return (Math.round(Math.random())-0.5);
}

// State Vars
// ==========
var state,
  moveQueue;
// Num players
var numPlayers = 1;
// World state
var gravity = 3;
var dt = 1/6;
var spawnSpacing = 50;
var spawnHeight = 10;
// Game option
var mapWidth = 1280;
var mapHeight = 720;
var deathMargin = 200;
var xoffset = 30;
var yoffset = 20;

var stageHeight = 378;

//these numbers are random guesses and subject to change
var stageLeft = 1010;
var stageRight = 260;

var fps = 3;

var neutralGroundAttackHitSpeed = 10;
var neutralAirAttackHitSpeed = 19;
var sideGroundAttackHitSpeed = 17;
var airRearAttackHitSpeed = 25;
var airFrontAttackHitSpeed = 18;

var lastHit;
var neutralAttackFrames = 20;

var players = [];

// Private Helpers
// ===============


var leftAttack = function (player) {
  player.attackFrames = 20;
  if(player.onGround){
    player.facing = 'left';
    player.reach_left = player.groundSideReach;
  }
  else{
    if (player.facing === 'left'){
      player.reach_left = player.aerialFrontReach;
    }
    else{
      player.reach_left = player.aerialRearReach;
    }
  }
};

var rightAttack = function (player){
  player.attackFrames = 20;
  if(player.onGround){
    player.facing = 'right';
    player.reach_right = player.groundSideReach;
    player.action = 'rightGroundAttack';
  }
  else{
    if (player.facing === 'right'){
      player.reach_right = player.aerialFrontReach;
      player.action = 'rightAerialFrontAttack';
    }
    else{
      player.reach_right = player.aerialRearReach;
      player.action = 'rightAerialRearAttack';
    }
  }
  for (var i = players.length - 1; i >= 0; i--) {
    rightAttackCollision(player, players[i]);
  }
};

var neutralAttack = function (player) {
  player.attackFrames = neutralAttackFrames;
  if (player.onGround){
    if (player.facing === 'right'){
      player.reach_right = player.groundNeutralReach;
    }
    if (player.facing === 'left'){
      player.reach_left = player.groundNeutralReach;
    }
  } else {
    if (player.facing === 'right'){
      player.reach_right = player.aerialNeutralReach;
    }
    if (player.facing === 'left'){
      player.reach_left = player.aerialNeutralReach;
    }
  }
  var playerAttackOrder = [];
  var i;
  for (i = players.length - 1; i >= 0; i--) {
    playerAttackOrder.push(i);
  }
  playerAttackOrder.sort(randOrd);
  for (i = players.length - 1; i >= 0; i--) {
    if (player !== players[playerAttackOrder[i]]) {
      neutralAttackCollision(player, players[playerAttackOrder[i]]);
    }
  }
  player.action = 'attack';
};

var neutralAttackCollision = function(attacker, victim) {
  //console.log(attacker, victim);
  if (victim.invulnFrames === 0 && (attacker.y.between(victim.y, victim.y + victim.height) || (attacker.y + attacker.height).between(victim.y, victim.y + victim.height))) {
    var dir = 0;
    if ((attacker.facing === 'left') && (victim.x+victim.width).between(attacker.x-attacker.reach_left, attacker.x+attacker.width)){
      dir = -1;
    }
    if ((attacker.facing === 'right') && (victim.x).between(attacker.x, attacker.x+attacker.width+attacker.reach_right)){
      dir = 1;
    }
    if (dir !== 0) {
      victim.lastHit = attacker.playerId;
      victim.damage += Math.round(Math.random()*10);
      victim.airJumps = 0;
      victim.damage += 40;
      dir = dir * (1 + victim.damage/100);
      if (attacker.onGround) {
        victim.damage += 15;
        victim.v_x += dir * attacker.neutralGroundAttackHitSpeed;
      } else{
        victim.damage += 25;

        victim.v_x += dir * attacker.neutralAirAttackHitSpeed;
      }
      victim.state = 'stun';
      victim.onGround = false;
      victim.v_y = -80 * (1+victim.damage/500);
      victim.damageFrames = 50+victim.damage/20;
      victim.invulnFrames = 15;
      //console.log(victim)
    }
  }
};

var leftAttackCollision = function(attacker, victim){
  if (attacker.y.between(victim.y, victim.y+victim.height) || (attacker.y+attacker.height).between(victim.y, victim.y+victim.height)){
    var dir = 0;
    if ((victim.x+victim.width).between(attacker.x-attacker.reach_left, attacker.x+attacker.width)){
      dir = -1;
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
};

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
};

var upAttackCollision = function(attacker, victim){

};

var downAttackCollision = function(attacker, victim){

};

var canMove = function (player) {
  return player.damageFrames <= 0 && player.attackFrames <= 0;
};

var isDead = function (player) {
  return player.x <= -deathMargin ||
    player.x > mapWidth + deathMargin ||
    player.y < -deathMargin ||
    player.y > mapHeight + deathMargin;
};

var runMove = function (playerId) {
  var player = players[playerId];
  if (canMove(player)) {
    switch (moveQueue[playerId]) {
      // Basic movement
      case 'left':
        player.moveLeft();
        break;
      case 'right':
        player.moveRight();
        break;
      case 'leftUp':
        player.moveLeft();
        player.moveUp();
        break;
      case 'rightUp':
        player.moveRight();
        player.moveUp();
        break;
      case 'leftDown':
        player.moveLeft();
        player.moveDown(gravity);
        break;
      case 'rightDown':
        player.moveRight();
        player.moveDown(gravity);
        break;
      case 'up':
        player.moveUp();
        break;
      case 'down':
        player.moveDown(gravity);
        break;
      case 'attack':
        neutralAttack(player);
        break;
      case 'leftAttack':
        leftAttack(player);
        break;
      case 'rightAttack':
        rightAttack(player);
        break;
      case 'downAttack':
        downAttack(player);
        break;
      case 'upAttack':
        upAttack(player);
        break;
      // Basic attacks
      // Special moves
      // No movement
      default:
        player.v_x = player.v_x / 3;
        if (player.v_x < 0) {
          player.v_x = Math.ceil(player.v_x);
        } else {
          player.v_x = Math.floor(player.v_x);
        }
        if (player.v_x === 0) {
          player.action = 'stand';
        }
        break;
    }
  } else if (player.damageFrames > 0) {
    player.action = 'stun';
    player.frame = 0;
  }

  // check for collision w\ stage
  if (player.y > stageHeight && (player.y - player.v_y*6*dt) < stageHeight && player.x > stageRight && player.x < stageLeft) {
    player.y = stageHeight;
    player.onGround = true;
    player.jumps = player.maxAirJumps;
    player.jumpTimeout = 0;
    player.v_y = 0;
  }

  // add gravity if not on the ground
  if (!player.onGround) {
    player.v_y += gravity;
    if (player.jumpTimeout > 0) {
      player.jumpTimeout -= 1;
    }
  } else if(player.x < stageRight || player.x > stageLeft) {
    player.onGround = false;
  }



  if (player.attackFrames > 0) {
    player.attackFrames -= 1;
    for (i = players.length - 1; i >= 0; i--) {
      if (player !== players[i]) {
        neutralAttackCollision(player, players[i]);
      }
    }

    if (player.attackFrames === 0) {
      player.reach_left = 0;
      player.reach_right = 0;
      player.reach_bottom = 0;
      player.reach_top = 0;
    }
  }

  if (player.damageFrames > 0) {
    player.damageFrames -= 1;
    if (player.damageFrames <= 2) {
      player.action = 'stand';
    }
  }

  if (player.invulnFrames > 0){
    player.invulnFrames -= 1;
  }

  // Position calculation
  player.x += player.v_x * dt;
  player.y += player.v_y * dt;

  if (isDead(player)) {
    players[playerId] = playerstate.getPlayerState(playerId, player.playerId, spawnSpacing, spawnHeight);
    var i, fn;
    for (i = 0; i < deathHook.length; i++) {
      fn = deathHook[i];
      if (fn(playerId, player.lastHit)) {
        break;
      }
    }
  }

  // animate
  if (player.damageFrames <= 0) {
    player.frame += 1;
    if (player.frame >= 4 * fps) {
      player.frame = 0;
    }
  }
};

// noop by default
var deathHook = [];

// Public API
// ==========
module.exports = {
  // Restart the game
  restart: function (newNumPlayers) {
    numPlayers = newNumPlayers;
    players = [];
    var i;
    for (i = 0; i < numPlayers; i++) {
      players[i] = playerstate.getPlayerState(i, 0, spawnSpacing, spawnHeight);
    }
    moveQueue = [];
  },
  // Update frame using latest actions
  runFrame: function () {
    // Process moves
    var priorityQueue = [];
    var i;
    for (i = 0; i < numPlayers; i++){
      priorityQueue[i] = i;
    }

    priorityQueue.sort(randOrd);
    for (i = 0; i < numPlayers; i++) {
      runMove(priorityQueue[i]);
    }
    // Process hits
    for (i = 0; i < numPlayers; i++) {
      //detectHits(i);
    }
    // Detect collision (optional)
    // Detect ground for each char
    /*
    for (var i = 0; i < numPlayers; i++) {
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

    for (i = 0; i < numPlayers; i++) {
      moveQueue[i] = null;
    }
  },

  setMove: function (player, move) {
    moveQueue[player] = move;
  },

  get: function () {
    return state;
  },
  getSerialized: function () {
    return {
      characters: players.map(function (pl) {
        return {
          x: pl.x,
          y: pl.y,
          
          height: pl.height,
          width: pl.width,

          frame: Math.floor(pl.frame / fps),
          action: pl.action,

          facing: pl.facing,
          damage: pl.damage
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
    };
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
