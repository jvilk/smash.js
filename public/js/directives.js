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
    link: function(scope, elm, attrs) {
      var canvas = angular.element('<canvas width="1280" height="720"></canvas>');
      elm.append(canvas);

      socket.on('send:state', function (state) {
        refresh(canvas[0], state.characters);
      });
    }
  }
});
