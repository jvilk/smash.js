'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var myServices = angular.module('myApp.services', []);

myServices.value('version', '0.1');

myServices.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

// TODO: enable/disable??
myServices.factory('keys', function ($window, socket) {

  var LEFT = 37, // arrow keys
    RIGHT = 39,
    UP = 38,
    DOWN = 40;

  var moveType = function () {
    if (keyState[LEFT]) {
      return 'left';
    } else if (keyState[RIGHT]) {
      return 'right';
    } else if (keyState[UP]) {
      return 'up';
    } else if (keyState[DOWN]) {
      return 'down';
    }
  };

  var keyState = {};

  $window.addEventListener('keydown', function (ev) {
    ev.preventDefault();
    keyState[ev.keyCode] = true;
  });
  
  $window.addEventListener('keyup', function (ev) {
    ev.preventDefault();
    delete keyState[ev.keyCode];
  });

  return {
    enable: function () {
      setInterval(function () {
        socket.emit('submit:move', moveType());
      }, 30);      
    }
  };

});
