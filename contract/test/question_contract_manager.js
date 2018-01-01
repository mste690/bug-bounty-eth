var QuestionContractManager = artifacts.require('./QuestionContractManager.sol');

contract('QuestionContractManager', function(accounts) {
  it("should not fail with valid input", async function() {
    var question_contract_manager = await QuestionContractManager.deployed();
    var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
  });
  
  it("should fail if questionText is an empty string", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
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
      await question_contract_manager.SubmitQuestion(longString, ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the list of tags contains an empty string", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", ""], 2017, 500, 1000, 28, 20, {value: 1020});
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
      await question_contract_manager.SubmitQuestion("questiontext", tags, 2017, 500, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the list of tags contains duplicate tags", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag1"], 2017, 500, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the bountyMinValue is 0", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 0, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });


  it("should fail if the bountyMinValue is negative", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, -1, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });


  it("should fail if the bountyMinValue is greater than bountyMaxValue", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 1001, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the bountyMinValue is equal to bountyMaxValue", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 1000, 1000, 28, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the value given to the contract is less than to the bountyMaxValue plus the tip", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1000});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });


  it("should fail if the value given to the contract is greater than to the bountyMaxValue plus the tip", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1030});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });


  it("should fail if the bounty timeToMaxValue is negative", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, -5, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the bounty timeToMaxValue is greater than 28 days", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    const LONG_TIME = (28 * 24 * 60 * 60) + 1 
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, LONG_TIME, 20, {value: 1020});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

  it("should fail if the bounty tip is less than 1% of the bounty max value", async function() {
    const question_contract_manager = await QuestionContractManager.deployed();
    try {
      await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 19, {value: 1019});
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  });

});
