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
var state, moveQueue;
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

var stageHeight = 378;

//these numbers are random guesses and subject to change
var stageLeft = 1010;
var stageRight = 260;

var fps = 3;

var players = [];

// Private Helpers
// ===============
var neutralAttack = function (player) {
  player.attackFrames = player.neutralAttackFrames;
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
    }
  }
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
        //leftAttack(player);
        break;
      case 'rightAttack':
        //rightAttack(player);
        break;
      case 'downAttack':
        //downAttack(player);
        break;
      case 'upAttack':
        //upAttack(player);
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
    players[playerId] = playerstate.getPlayerState(playerId, player.playerId, player.playerId * spawnSpacing + 500, spawnHeight);
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
      players[i] = playerstate.getPlayerState(i, 0, i * spawnSpacing + 500, spawnHeight);
    }
    moveQueue = [];
  },
  // Update frame using latest actions
  runFrame: function () {
    // JVILK'S ENVISIONED REVISION
    // 0. Client only knows about 'entities'. 'entities' are
    //    defined by their type and image. The client only needs
    //    to stupidly paint the entities at the right location
    //    and at the right depth (z), and it needs to know which are
    //    players so it can determine name and damage info.
    //    Animations...?

    // 1: Randomize player update order.
    //
    // FOR EACH PLAYER:
    // 2: Pass to the player's character object the playerstate,
    //    the stage, and the move that is being done.
    //    (left, leftattack, right, rightattack, etc)
    //    (or direction, isAttacking combo)
    // MOVE PHASE:
    // 3. Determine the player's new velocity with this
    //    information, and set them in the object.
    // 3: Determine the player's new x and y coordinates
    //    with this information. DO NOT UPDATE THE PLAYERSTATE.
    // 4: Pass the player state and the new x and y coordinates
    //    to the stage.
    // 5: The stage will determine:
    //    * 'Safe' x and y coordinates according to terrain concerns.
    //    * If the player has collided with a stage object, it will
    //      update the player's damage, velocity, state, and other
    //      variables accordingly.
    //    * Potentially also the ability to update the velocity according
    //      to the angle of the platform, friction, and other info.
    //    It will mutate the playerinfo accordingly, and return to
    //    the character function.
    // 6: Next, if the player is attacking and eligible to attack,
    //    the player's action (left/right/up/down attack) will
    //    select the appropriate 'attack' object.
    //    'eligible' means not stunned, etc.
    //    'attack' objects either:
    //     * Create a bounding box relative to the character that causes
    //       others a certain amount of damage and lasts a specific amount
    //       of turns unless preempted. Only one of these can occur at
    //       a time. They can be preempted by various things, too.
    //       (player gets hit somehow, player uses some command that
    //       aborts it...).
    //       Note that you can allow the current attack to influence
    //       the logic above that determines the player's new velocity
    //       for movements (e.g. b+up in Melee with Link influences
    //       left+right mobility and cannot be escaped w/ a jump).
    //       Also, note that the entity may also need a reference back
    //       to the player.
    //
    //     * Creates a nonplayer entity that has its own velocity and game logic.
    //       We can have as many of these as we want, although they may
    //       record data in the playerState regarding when it was last
    //       used. They are updated in a similar fashion as players,
    //       except they do not have any movement -- they are
    //       just influenced by the environment.
    //
    //    Both types of attacks are registered with the global
    //    state as nonplayer entities with bounding boxes. The only
    //    difference between them is that playerState is aware of
    //    the non-projectile attack.
    //
    // ENDFOR
    //
    // 7: Randomize all nonplayer entities (including those created
    //    this turn). MAKE A COPY OF THIS STRUCT -- nonplayer entities
    //    can be created as a result of processing these entities.
    //
    // Now we're at collision detection. :)
    //
    // FOR EACH NONPLAYER ENTITY:
    // 8: Run a 'move' (have it update its x and y position according
    //    to its velocity, and check if it hits something on the stage).
    //    You can imagine it mutating, e.g. a missile hitting a wall could
    //    turn into an explosion nonplayer entity that hurts nearby
    //    players.
    //    This returns to runFrame.
    // 9: Determine if it collides with any other entity, player or
    //    non-player. If it does, run its collision function with
    //    the target.
    //    Note that this (collision detection) could be optimized
    //    if it proves slow.
    //    See some of the posts on my friend's blog...
    //    http://ductomaniac.wordpress.com/
    //
    //    You can imagine these having fun special cases, e.g.
    //    Link's Sword with Link's Sword results in the attacks
    //    canceling out.
    //    You can also imagine having a 'priority' attribute that
    //    determines which wins out. Or having things mutate
    //    (sword + missile = kaboom).
    //
    // Other notes:
    // * We should have a concept of 'mass' and 'force'.
    // * Things should exert directed force on other things.
    // * Damage decreases weight, as in Smash. (weight vs effective weight)
    //   Player movement, which exerts a force, will always use weight.
    //   Note that weight is determined by the current gravity. :)
    // * We could also envision stages as a set of permanent 'nonplayer'
    //   entities that cause a player to be grounded on collision.
    //   Or that causes a player to move in a certain way on collision
    //   with velocity (friction). This also makes it easy for us to make
    //   moving platforms / slopes / one sided platforms / etc. :)
    //   We'll have to process objects that occur first in this vector
    //   of movement, though...
    

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
    //TODO(jvilk): This is empty...
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
