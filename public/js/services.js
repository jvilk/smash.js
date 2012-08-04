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
    DOWN = 40,
    A = 65;

  var moveType = function () {
    if (keyState[LEFT] && keyState[UP]) {
      return 'leftUp';
    } else if (keyState[LEFT] && keyState[DOWN]) {
      return 'leftDown';
    } else if (keyState[RIGHT] && keyState[UP]) {
      return 'rightUp';
    } else if (keyState[RIGHT] && keyState[DOWN]) {
      return 'rightDown';
    } else if (keyState[RIGHT]) {
      return 'right';
    } else if (keyState[LEFT]) {
      return 'left';
    } else if (keyState[UP]) {
      return 'up';
    } else if (keyState[DOWN]) {
      return 'down';
    } else if (keyState[A]) {
      return 'attack';
    }
  };

  var keyState = {};

  function registerKeyDown (ev) {
    ev.preventDefault();
    keyState[ev.keyCode] = true;
  }

  function registerKeyUp (ev) {
    ev.preventDefault();
    delete keyState[ev.keyCode];
  }

  $('input').focus(function () {
    $window.removeEventListener('keydown', registerKeyDown);
    $window.removeEventListener('keyup', registerKeyUp);
  });
  
  $('input').blur(function () {    
    $window.addEventListener('keydown', registerKeyDown);
    $window.addEventListener('keyup', registerKeyUp);
  });

  $window.addEventListener('keydown', registerKeyDown);
  $window.addEventListener('keyup', registerKeyUp);

  var enabled = false;

  return {
    enable: function () {
      if (enabled) {
        return;
      }
      enabled = true;

      setInterval(function () {
        socket.emit('submit:move', moveType());
      }, 30);      
    }
  };

});
