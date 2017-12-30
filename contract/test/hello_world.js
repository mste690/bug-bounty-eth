var HelloWorld = artifacts.require('./HelloWorld.sol');

contract('HelloWorld', function(accounts) {
  it("should return hello world", function(done) {
    var hello_world = HelloWorld.deployed();
    hello_world.then(function(contract){
      return contract.GetMessage.call();
    }).then(function(result){
      assert.isTrue(result === 'Hello World');
      done();
    })
  });
});
