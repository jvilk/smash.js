$(document).ready(main);

function main() {
  var canvas = $("#game").clearCanvas();

  // draw background
  //canvas.drawImage({
  //  source: "images/final-destination.png",
  //  x: canvas.width()/2,
  //  y: canvas.height()/2,
  //  width: canvas.width(),
  //  height: canvas.height(),
  //});
  canvas.drawRect({
    x: canvas.width()/2,
    y: canvas.height()/2,
    width: canvas.width(),
    height: canvas.height(),
    fillStyle: "#EEE"
  });

  var characters = [
    {
      portrait: "images/link/sprite.gif",
      character: "images/link/character.gif",
      x: 100,
      y: 100,
      width: 100,
      height: 150,
      damage: 24,
      name: "Link"
    },
    {
      portrait: "images/link/sprite.gif",
      character: "images/link/character.gif",
      x: 200,
      y: 200,
      width: 120,
      height: 150,
      damage: 73,
      name: "Kirby"
    },
    {
      portrait: "images/link/sprite.gif",
      character: "images/link/character.gif",
      x: 600,
      y: 300,
      width: 100,
      height: 190,
      damage: 187,
      name: "Fox"
    },
    {
      portrait: "images/link/sprite.gif",
      character: "images/link/character.gif",
      x: 1000,
      y: 400,
      width: 200,
      height: 250,
      damage: 289,
      name: "JigglyPuff"
    },
  ];
  $.each(characters, function(i, character) {
    var x = canvas.width() * (1.0 + i)/(1.0 + characters.length),
        y = canvas.height() * (1.0 - 1.0/5.0),
        iconHeight = canvas.height() * (1.0/6.0),
        iconWidth = canvas.width() * (1.0/8.0);

    canvas.drawRect({
      x: x,
      y: y,
      width: iconWidth,
      height: iconHeight,
      fillStyle: "#000"
    });

    // draw character names
    var fontSize = iconHeight * 1.0/5.0;
    canvas.drawText({
      x: x,
      y: y + iconHeight/2.0 - fontSize/2.0,
      text: character.name,
      align: 'center',
      font: fontSize + "px Arial",
      fillStyle: "#FFF"
    });

    // draw character portrait
    var portraitWidth = iconHeight * 3.0/5.0,
        portraitHeight = iconWidth * 2.0/4.0;

    canvas.drawRect({
      x: x - iconWidth/2.0 + portraitWidth/2.0,
      y: y - iconHeight/2.0 + portraitHeight/2.0,
      width: portraitWidth,
      height: portraitHeight,
      fillStyle: "#F00"
    });

    // draw character damage
    fontSize = iconHeight * 3.0/5.0;
    canvas.drawText({
      x: x,
      y: y - iconHeight/2.0 + portraitHeight/2.0,
      text: character.damage,
      align: "left",
      font: fontSize + "px Arial",
      fillStyle: "#FFF"
    });

    // draw character image
    canvas.drawRect({
      x: character.x,
      y: character.y,
      width: character.width,
      height: character.height,
      fillStyle: "#00F"
    });
  })
}
