'use strict';

/* Controllers */

function AppCtrl($rootScope, socket) {

  $rootScope.users = [];

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $rootScope.name = data.name;
    $rootScope.users = data.users;
  });

  socket.on('change:name', function (data) {
    $rootScope.changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $rootScope.users.push(data.name);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    var i, user;
    for (i = 0; i < $rootScope.users.length; i++) {
      user = $rootScope.users[i];
      if (user === data.name) {
        $rootScope.users.splice(i, 1);
        break;
      }
    }
  });

  $rootScope.changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $rootScope.users.length; i++) {
      if ($rootScope.users[i] === oldName) {
        $rootScope.users[i] = newName;
      }
    }
  }

}


function PlayCtrl($rootScope, keys) {
  keys.enable();
}

function NameCtrl($rootScope, $scope, socket, keys) {
  keys.enable();

  // Private helpers
  // ===============

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        $rootScope.changeName($rootScope.name, $scope.newName);

        $rootScope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };
}

function DebugCtrl($scope, socket) {
  socket.on('send:state', function (data) {
    $scope.state = data;
  });
}
