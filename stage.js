// Grid
var grid;
// Array of platforms
var platforms = [];

module.exports = {
  newPlatform: function(x, y, width, height) {
    platforms.push({
      left: x,
      right: x + width,
      bottom: y,
      top: y + height
    });
  },

  getPlatforms: function () {
    return platforms;
  },

  hasCollided: function (x, y) {
    collided = false;
    for (var i = platforms.length - 1; i >= 0; i--) {
      var platform = platforms[i];
      collided = collided || (platform.left < x < platform.right && platform.bottom < y < platform.top);
    }
    return collided;
  }
}