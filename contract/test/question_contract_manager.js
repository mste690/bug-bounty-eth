var QuestionContractManager = artifacts.require('./QuestionContractManager.sol');
var Question = artifacts.require('./Question.sol');

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

  it("should return address to question contract", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    //check the result is a valid ethereum address
    assert.isOk(web3.isAddress(result), 'SubmitQuestion did not return valid ethereum address');
    var questionContract = Question.at(result);
    //check that the instantiated contract has a questiontext field that matches the input
    assert.equal(questionContract.questiontext, "questiontext");
  });

  it("should create Question contract with correct inputs", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    var questionContract = Question.at(result);
    //check that the instantiated contract has a questiontext field that matches the input
    assert.equal(questionContract.questiontext, "questiontext");
    assert.equal(questionContract.tags, ["tag1", "tag2"]);
    assert.equal(questionContract.submittedTime, 2017);
    assert.equal(questionContract.bounty.minValue, 500);
    assert.equal(questionContract.bounty.maxValue, 1000);
    assert.equal(questionContract.bounty.timeToMaxValue, 28);
  });
  
});
