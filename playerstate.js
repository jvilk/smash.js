/**
 * These objects contain an individual player's state and logic
 * to update that state.
 */

// Imports
var _ = require('underscore');
var characters = require('./characters.js');

/**
 * PlayerState object. We do not use a prototype for this class
 * to avoid slightly expensive prototype lookups. As a result,
 * we suffer the overhead of recreating each function every
 * time an object is created.
 *
 * The good news is that that only happens when either the stage
 * is initially created or when players die. So, unless players
 * are dying every few milliseconds, we're good. :)
 */
var createState = function(thePlayerId, characterId, start_x, start_y) {
  var character = characters.getCharacter(characterId);

  var defaultState = {
    playerId: thePlayerId,
    // Position
    // should really get from state directly...
    x: start_x,
    y: start_y,

    // Direction facing
    facing: 'left',
    // Velocity
    v_x: 0,
    v_y: 0,
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
    invulnFrames: 0,
    lastHit : -1,
    // TODO(jvilk): We're just copying an attribute here...
    jumps: character.maxAirJumps,
    jumpTimeout: 0
  };

  // TODO(jvilk): We should not have to copy the character object
  // here. Refactor.
  var playerState = _.extend(defaultState, character);

  // TODO: These should be in 'character'.
  playerState.moveLeft = function() {
    if (this.onGround) {
      this.v_x = -75;
    }
    else {
      this.v_x = -50;
    }
    this.action = 'run';
    this.facing = 'left';
  };

  playerState.moveRight = function() {
    if (this.onGround) {
      this.v_x = 75;
    }
    else {
      this.v_x = 50;
    }
    this.action = 'run';
    this.facing = 'right';
  };

  playerState.moveUp = function() {
    if (this.jumps > 0 && this.jumpTimeout <= 0) {
      this.onGround = false;
      this.jumps -= 1;
      this.jumpTimeout = 20;
      if (this.onGround) {
        this.v_y = -120;
      }
      else {
        this.v_y = -80;
      }
    }
  };

  playerState.moveDown = function(gravity) {
    if (!this.onGround) {
      this.v_y += gravity * 2;
    }
  };

  return playerState;
};


module.exports = {
  getPlayerState: createState
};