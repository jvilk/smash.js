var state = require('../state.js');

// Assertion syntax: https://github.com/visionmedia/should.js
describe('state', function(){

  beforeEach(function () {
    state.restart(1);
  });

  it('should be initialized with four chars', function(){
    state.get().characters.length.should.eql(1);
  });
  
  describe('#runFrame', function(){
    it('should have working gravity', function(){
      state.runFrame();
      var config = state.getConfig();
      var char1 = state.get().characters[0];

      char1.a_y.should.eql(config.gravity);
    });
  });
  

});
