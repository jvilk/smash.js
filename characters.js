/**
 * This module sets up and exports singleton objects that contain
 * the base attributes for each character.
 *
 * As a result, these objects should be considered read-only.
 *
 * (As a matter of terminology, 'character' refers to a specific
 * Smash Bros. fighter [e.g. Mario]. This is not to be confused
 * with 'player', which is one of the players)
 */

// Imports
var _ = require('underscore');

/**
 * Default character attributes.
 * This is a starting template for defining a new character in
 * the game. Override specific properties in characterOverrides.
 */
var defaultAttrs = {
  name : "Mr. Spanky",
  height : 40,
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
  neutralAttackFrames: 20
};

/**
 * Character-specific attributes. These override default values.
 * To add a new character, just add an object to this array.
 * Each character's position in the array defines its id.
 */
var charsAttrs = [
  {
    name: "Link"
  },
  {
    name: "Kirby"
  },
  {
    name: "Captain Falcon"
  }
];

/**
 * We merge the above two data structures together to form a singleton object
 * for each character.
 */
var characters = [];
// Initialize the characters array.
charsAttrs.forEach(function(charAttrs, index, array) {
  // extend will mutate this, so we clone it first.
  var clonedDefaultAttrs = _.clone(defaultAttrs);
  var character = _.extend(clonedDefaultAttrs, charAttrs);

  // Tell the character what its id is.
  character.characterId = index;

  characters.push(character);
});

module.exports = {
  getCharacter: function(charId) {
    return characters[charId % characters.length];
  },
  getCharacters: function() {
    return characters;
  }
};