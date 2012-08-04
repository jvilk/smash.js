$(document).ready(main);

function main() {
  prefetchImages(['link', 'kirby', 'asshole']);
  var characters = [
    {
      portrait: "link-sprite",
      sprite: "link-character",
      x: 100,
      y: 100,
      width: 100,
      height: 150,
      damage: 24,
      name: "Link"
    },
    {
      portrait: "link-sprite",
      sprite: "link-character",
      x: 200,
      y: 200,
      width: 120,
      height: 150,
      damage: 73,
      name: "Kirby"
    },
    {
      portrait: "link-sprite",
      sprite: "link-character",
      x: 600,
      y: 300,
      width: 100,
      height: 190,
      damage: 187,
      name: "Fox"
    },
    {
      portrait: "link-sprite",
      sprite: "link-character",
      x: 1000,
      y: 400,
      width: 200,
      height: 250,
      damage: 289,
      name: "JigglyPuff"
    },
  ];

  // initialize refresh loop
  setInterval(function() {
    $.each(characters, function(i, char) {
      char.x += 10*(Math.random() - 0.5);
      char.y += 10*(Math.random() - 0.5);
    });
    refresh($("#game"), characters);
  }, 1000/60);
}

function refresh(elt, characters) {
  var canvas = $(elt).clearCanvas();

  // draw background
  canvas.drawImage({
    source: $("#final-destination")[0],
    x: canvas.width()/2,
    y: canvas.height()/2,
    width: canvas.width(),
    height: canvas.height(),
  });
  //canvas.drawRect({
  //  x: canvas.width()/2,
  //  y: canvas.height()/2,
  //  width: canvas.width(),
  //  height: canvas.height(),
  //  fillStyle: "#EEE"
  //});

  /////////////////////////// Draw Characters ////////////////////////////////////
  $.each(characters, function(i, character) {
    // draw character image
    canvas.drawImage({
      source: $('#' + character.sprite)[0],
      x: character.x,
      y: character.y,
      width: character.width,
      height: character.height,
    });
    //canvas.drawRect({
    //  x: character.x,
    //  y: character.y,
    //  width: character.width,
    //  height: character.height,
    //  fillStyle: "#00F"
    //});
  })

  /////////////////////////// Draw Character Portraits ///////////////////////////
  $.each(characters, function(i, character) {
    var x = canvas.width() * (1.0 + i)/(1.0 + characters.length),
        y = canvas.height() * (1.0 - 1.0/5.0),
        iconHeight = canvas.height() * (1.0/6.0),
        iconWidth = canvas.width() * (1.0/8.0);

    // Bounding box for portrait, name, etc
    //canvas.drawRect({
    //  x: x,
    //  y: y,
    //  width: iconWidth,
    //  height: iconHeight,
    //  fillStyle: "#000"
    //});

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

    canvas.drawImage({
      source: $('#' + character.portrait)[0],
      x: x - iconWidth/2.0 + portraitWidth/2.0,
      y: y - iconHeight/2.0 + portraitHeight/2.0,
      width: portraitWidth,
      height: portraitHeight,
    });
    //canvas.drawRect({
    //  x: x - iconWidth/2.0 + portraitWidth/2.0,
    //  y: y - iconHeight/2.0 + portraitHeight/2.0,
    //  width: portraitWidth,
    //  height: portraitHeight,
    //  fillStyle: "#F00"
    //});

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

  })
}

function prefetchImages(characterArr) {
  var body = $('body');
  var div;
  $.each(characterArr, function(index, name) { 
    div = '<img id="'+ name +'-portrait" src="/images/'+ name +'/portrait.gif">';
    body.append(div);
    div = '<img id="'+ name +'-sprite" src="/images/'+ name +'/sprite.gif">';
    body.append(div);
  });
}
