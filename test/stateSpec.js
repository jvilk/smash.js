var state = require('../state.js');

// Assertion syntax: https://github.com/visionmedia/should.js
describe('state', function(){

  beforeEach(function () {
    state.restart(4);
  });

  it('should be initialized with four chars', function(){
    state.get().characters.length.should.eql(4);
  });
  /*
  describe('#addPlayer', function(){
    it('should have one more player after adding one', function(){
      game.addPlayer(new Player());
      game.numberOfPlayers().should.eql(1);
    });

    it('should return true on a successful add', function(){
      game.addPlayer(new Player()).should.be.true;
    });

    it('should not allow the same player to be added twice', function(){
      var player = new Player();
      game.addPlayer(player);
      game.addPlayer(player);
      game.numberOfPlayers().should.eql(1);
    });
    
    it('should bind to a player disconnect', function () {
      var player = new Player();
      game.addPlayer(player);
      player.trigger('disconnect');
      game.numberOfPlayers().should.eql(0);
    });
  });
  */

});
