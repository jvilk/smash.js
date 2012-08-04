'use strict';

/* Controllers */

function AppCtrl($scope, socket) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });
}

function MyCtrl1($scope, socket) {
  socket.on('send:state', function (data) {
    $scope.state = data;
  });
  $scope.left = function () {
    socket.emit('submit:move', 'left');
  };
  $scope.right = function () {
    socket.emit('submit:move', 'right');
  };
}


function MyCtrl2() {
}
