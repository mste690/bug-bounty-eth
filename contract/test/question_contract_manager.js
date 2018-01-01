var QuestionContractManager = artifacts.require('./QuestionContractManager.sol');

contract('QuestionContractManager', function(accounts) {
  it("should assert true", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    assert.equal(result, "asdsadsa");
  });
  
  it("should fail if questionText is an empty string", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("", ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if questionText is longer than the maximum character length", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    const MAX_CHARS = 500;
    let longString = "";
    for (let i = 0; i <= MAX_CHARS; i++) {
      longString += "a";
    }
    
    try {
      await question_contract_manager.SubmitQuestion(longString, ["tag1", "tag2"], 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the list of tags contains an empty string", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", ""], 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the list of tags contains more than the maximum number of allowed tags", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    const MAX_TAGS = 10;
    let tags = [];
    for (let i = 0; i <= MAX_TAGS; i++) {
      tags.push(`tag ${i}`);
    }

    try {
      await question_contract_manager.SubmitQuestion("questiontext", tags, 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the list of tags contains duplicate tags", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag1"], 2017, 500, 1000, 28, 20);
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

});
