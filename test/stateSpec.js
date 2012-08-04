var state = require('../state.js');
var config;
var char1;

// Assertion syntax: https://github.com/visionmedia/should.js
describe('state', function(){

  beforeEach(function () {
    state.restart(1);
  });

  it('should be initialized with four chars', function(){
    state.get().characters.length.should.eql(1);
  });
  describe('#runFrame', function(){
    beforeEach(function(){
      config = state.getConfig();
      char1 = state.get().characters[0];
    });
    it('should have working gravity', function(){
      state.runFrame();
        char1.a_y.should.eql(config.gravity);
    });
    it('should not be moving initially', function(){
      state.runFrame();
      for (var i = state.get().characters.length - 1; i >= 0; i--) {
        var character = state.get().characters[i];
        character.v_x.should.eql(0);
        character.a_x.should.eql(0);
        character.v_y.should.eql(0);
      }
    });
    it('characters should be on the FUCKING GROUND FOR CHRISTS SAKE', function(){
      for (var i = state.get().characters.length - 1; i >= 0; i--) {
        var character = state.get().characters[i];
        character.onGround.should.eql(true);
      }
    });
    it('characters should move left when we tell them to move left', function(){
      state.setMove(1, 'left');
      state.runFrame();
      char1.a_x.should.be.below(0);
      char1.v_x.should.be.below(0);
      char1.x.should.be.below(config.spawnSpacing);
    });
    it('characters should move right when we tell them to', function(){
      state.setMove(1,'right');
      state.runFrame();
      char1.a_x.should.be.above(0);
      char1.v_x.should.be.above(0);
      char1.x.should.be.above(config.spawnSpacing);
    });


    });


  });
  

