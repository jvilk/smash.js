'use strict';

/* Directives */


var myDirectives = angular.module('myApp.directives', ['myApp.services']);

myDirectives.directive('appVersion', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
});


myDirectives.directive('smashGame', function (socket) {

  var characterNames = [
    'Link',
    'Link',
    'Link',
    'Link'
  ];

  var makeImg = function (src) {
    var img = new Image();
    img.src = '/images/' + src;
    return img;
  };

  var charResources = characterNames.map(function (res) {
    var lowRes = res.toLowerCase();

    var ret = {
      portrait: makeImg(lowRes + '/portrait.gif'),
      name: res
    };

    [
      {
        name:'stand',
        frames: 4
      }, {
        name:'run',
        frames: 4
      }, {
        name:'attack',
        frames: 4
      }
    ].forEach(function (item) {
      ret[item.name] = [];
      var i, num;
      for (i = 1; i <= item.frames; i++) {
        num = i;
        if (num < 10) {
          num = '0' + num;
        }
        ret[item.name].push({
          left: makeImg(lowRes + '/' + item.name + '_left/' + num + '.png'),
          right: makeImg(lowRes + '/' + item.name + '_right/' + num + '.png')
        })
      }
    })

    return ret;
  });

  var mapImg = makeImg('bg.png');

  var canvasWidth = 1280,
    canvasHeight = 720;

  var iconHeight = canvasHeight / 6,
    iconWidth = canvasWidth / 8,
    portraitWidth = iconHeight * 3/5,
    portraitHeight = iconWidth / 2;

  return {
    restrict: 'E',
    terminal: true,
    replace: true,
    link: function (scope, elm, attrs) {

      var aCanvas = angular.element('<canvas width="' + canvasWidth + '" height="' + canvasHeight + '"></canvas>');
      elm.append(aCanvas);

      var canvas = aCanvas[0];
      var ctx = canvas.getContext('2d');

      socket.on('send:state', function (state) {
        var characters = state.characters;

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw background
        ctx.drawImage(mapImg, 0, 0);

        // Draw Characters
        characters.forEach(function (ch, i) {
          var charResource = charResources[i];

          /*
          if (ch.facing === 'left') {}
          */
          ctx.drawImage(
            charResource[ch.action][ch.frame][ch.facing],
            ch.x,
            ch.y
          );

        });

        ctx.fillStyle = "#FFF";

        // Draw Character Portraits
        characters.forEach(function (ch, i) {

          var x = canvasWidth * (i + 0.82)/(characters.length + 1),
            y = canvasHeight * (4 / 5);

          // draw character portrait

          var charResource = charResources[i];

          // draw character names
          // ====================

          ctx.drawImage(
            charResource.portrait,
            x,
            y,
            portraitWidth,
            portraitHeight
          );

          // set font style
          var fontSize = iconHeight / 5;
          ctx.font = fontSize + "px Arial";
          ctx.align = 'center';

          ctx.fillText(
            charResource.name,
            x,
            y + iconHeight/2 - fontSize/2
          );

          // draw character damage
          // =====================
          /*
          // set font style
          fontSize = iconHeight * 3/5;
          ctx.font = fontSize + "px Arial";
          ctx.align = "left";

          // draw it
          ctx.fillText(
            ch.damage,
            x,
            y - iconHeight/2 + portraitHeight/2
          );
          */
        });

      });
    }
  };
});
