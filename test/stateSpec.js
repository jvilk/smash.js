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
      state.setMove(0, 'left');
      state.runFrame();
      char1.a_x.should.be.below(0);
      char1.v_x.should.be.below(0);
      char1.x.should.be.below(0);      
    });
    it('characters should move right when we tell them to', function(){
      state.setMove(0,'right');
      state.runFrame();
      char1.a_x.should.be.above(0);
      char1.v_x.should.be.above(0);
      char1.x.should.be.above(0);
    });
    it('characters should not be able to move above the max speed in the leftwise direction', function(){
      for (var i =  1000; i >= 0; i--) {
        state.setMove(0,'left');
        state.runFrame();
      };
      char1.v_x.should.be.equal(-1*config.maxGroundSpeed);
    });
    it('characters shouldnt be able to move above max speed in rightways motion', function(){
      for (var i =  1000; i >= 0; i--) {
        state.setMove(0,'right');
        state.runFrame();
      };
      char1.v_x.should.be.equal(config.maxGroundSpeed);
    });

    describe('#jumping', function(){
      it('characters should jump from the ground', function(){
        state.setMove(0,'up');
        state.runFrame();
        char1.a_y.should.be.above(0);
        char1.airJumps.should.be.equal(0);
      });
      
      it('characters should jump from the air at least once', function(){
        state.setMove(0,'up');
        state.runFrame();
        char1.onGround = false;
        state.setMove(0,'up');
        state.runFrame();
        char1.airJumps.should.be.equal(1);
        char1.a_y.should.be.above(0);
      });
      it('characters should not be able to jump more than their max air jumps', function(){
        state.setMove(0,'up');
        state.runFrame();
        char1.onGround = false;
        for(var i = 0; i < config.maxAirJumps; i++){
          state.setMove(0,'up');
          state.runFrame();
        }
        char1.airJumps.should.be.equal(config.maxAirJumps);
        state.setMove(0,'up');
        state.runFrame();
        char1.airJumps.should.be.equal(config.maxAirJumps);
        char1.a_y.should.be.equal(config.gravity);
      });


    });
    describe('#downmoving', function(){
      it('characters cant move down while standin still on the ground', function(){
        state.setMove(0,'down');
        state.runFrame();
        char1.a_x.should.be.equal(0);
        char1.a_y.should.be.equal(config.gravity);
      });

      it('characters cant move down while moving around on the ground', function(){
        state.setMove(0,'left');
        state.runFrame();
        state.setMove(0,'left');
        state.runFrame();
        state.setMove(0,'left');
        state.runFrame();
        state.setMove(0,'down');
        state.runFrame();

        char1.a_x.should.be.equal(0);
        char1.a_y.should.be.equal(config.gravity);
        state.setMove(0,'right');
        state.runFrame();
        state.setMove(0,'right');
        state.runFrame();
        state.setMove(0,'down');
        state.runFrame();
        char1.a_x.should.be.equal(0);
        char1.a_y.should.be.equal(config.gravity);
      });

      it('characters can move down while in the air! of course they can do that', function(){
        state.setMove(0,'up');
        state.runFrame();
        char1.onGround = false;
        state.setMove(0,'down')
        state.runFrame();
        char1.a_y.should.be.below(config.gravity);
      });

    })
    

    });


  });
  

