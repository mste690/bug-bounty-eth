var QuestionContractManager = artifacts.require('./QuestionContractManager.sol');

contract('QuestionContractManager', function(accounts) {
  it("should assert true", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    var result = await question_contract_manager.SubmitQuestion.call("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    assert.equal(result, 1);
  });
  
  it("should expect an error", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion.call("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });
});
