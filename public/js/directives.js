'use strict';

/* Directives */


var myDirectives = angular.module('myApp.directives', ['myApp.services']);

myDirectives.directive('appVersion', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
});


myDirectives.directive('smashGame', function (socket) {
  return {
    restrict: 'E',
    terminal: true,
    replace: true,
    link: function(scope, elm, attrs) {
      var canvas = angular.element('<canvas width="1280" height="720"></canvas>');
      elm.append(canvas);
      elm.append('<div class="hide"><img id="final-destination" src="images/final-destination.png">' +
        '<img id="link-sprite" src="images/link/sprite.gif">' +
        '<img id="link-character" src="images/link/character.gif"></div>');

      socket.on('send:state', function (state) {
        refresh(canvas[0], state.characters);
      });
    }
  };
});
