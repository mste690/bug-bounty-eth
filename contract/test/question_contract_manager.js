var QuestionContractManager = artifacts.require('./QuestionContractManager.sol');
var Question = artifacts.require('./Question.sol');

contract('QuestionContractManager', function(accounts) {
  let question_contract_manager;

  before(async () => {
    question_contract_manager = await QuestionContractManager.deployed();
  });

  expectTransactionToFail = async (transaction) => {
    try {
      await transaction;
    } catch (e) {
      return true;
    }
    assert.fail("Tx did not fail", "Tx should fail", "Expected transaction to fail, but it did not");
  }

  describe('SubmitQuestion', () => {
    it("should not fail with valid input", async function() {
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
    });

    it("should fail if questionText is an empty string", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020}))
    });

    it("should fail if questionText is longer than the maximum character length", async function() {
      const MAX_CHARS = 500;
      let longString = "";
      for (let i = 0; i <= MAX_CHARS; i++) {
        longString += "a";
      }
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(longString, ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the list of tags contains an empty string", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", ""], 2017, 500, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the list of tags contains more than the maximum number of allowed tags", async function() {
      const MAX_TAGS = 10;
      let tags = [];
      for (let i = 0; i <= MAX_TAGS; i++) {
        tags.push(`tag ${i}`);
      }

      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", tags, 2017, 500, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the list of tags contains duplicate tags", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag1"], 2017, 500, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the bountyMinValue is 0", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 0, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the bountyMinValue is negative", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, -1, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the bountyMinValue is greater than bountyMaxValue", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 1001, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the bountyMinValue is equal to bountyMaxValue", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 1000, 1000, 28, 20, {value: 1020}));
    });

    it("should fail if the value given to the contract is less than to the bountyMaxValue plus the tip", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1000}));
    });

    it("should fail if the value given to the contract is greater than to the bountyMaxValue plus the tip", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1030}));
    });

    it("should fail if the bounty timeToMaxValue is negative", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, -5, 20, {value: 1020}));
    });

    it("should fail if the bounty timeToMaxValue is greater than 28 days", async function() {
      
      const LONG_TIME = (28 * 24 * 60 * 60) + 1
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, LONG_TIME, 20, {value: 1020}));
    });

    it("should fail if the bounty tip is less than 1% of the bounty max value", async function() {
      await expectTransactionToFail(question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 19, {value: 1019}));
    });

    it("should return address to question contract", async function() {
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
      //check the result is a valid ethereum address
      assert.isOk(web3.isAddress(result), 'SubmitQuestion did not return valid ethereum address');
      var questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(questionContract.questiontext, "questiontext");
    });

    it("should create Question contract with correct inputs", async function() {
      var question_contract_manager = await QuestionContractManager.deployed();
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020});
      var questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(questionContract.questiontext, "questiontext");
      assert.equal(questionContract.tags, ["tag1", "tag2"]);
      assert.equal(questionContract.submittedTime, 2017);
      assert.equal(questionContract.bounty.minValue, 500);
      assert.equal(questionContract.bounty.maxValue, 1000);
      assert.equal(questionContract.bounty.timeToMaxValue, 28);
    });

    it("should have Question author as message sender", async function() {
      var question_contract_manager = await QuestionContractManager.deployed();
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      var questionContract = Question.at(result);
      //check that the author is the message sender
      assert.equal(questionContract.author, accounts[0]);
    });

    it("should have same Question contract balance as max bounty", async function() {
      var question_contract_manager = await QuestionContractManager.deployed();
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that the result contract balance is bounty maxValue
      assert.equal(web3.eth.getBalance(result), 1000);
    });

    it("should have Question isClosed as false", async function() {
      var question_contract_manager = await QuestionContractManager.deployed();
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      var questionContract = Question.at(result);
      //check that the author is the message sender
      assert.isFalse(questionContract.isClosed, "Question isClosed should be false on submission");
    });

    it("should have Question address in managers questions array", async function() {
      var result = await question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that result address is in questions
      assert.isOk(question_contract_manager.questions.includes(result), 'questions array should contain new question address');
    });

    it("should have no questions for new contract manager", async function() {
      let new_question_contract_manager = await QuestionContractManager.new();
      assert.equal(new_question_contract_manager.questions.length, 0, 'New manager should have no questions');
    });

    it("should have single address in new manager after submit", async function() {
      let new_question_contract_manager = await QuestionContractManager.new();
      let result = await new_question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that result address is in questions
      assert.isOk(new_question_contract_manager.questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(new_question_contract_manager.questions, 1, 'questions should contain 1 address');
    });

    it("should have two addresses in new manager after two submissions", async function() {
      let new_question_contract_manager = await QuestionContractManager.new();
      let result = await new_question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that result address is in questions
      assert.isOk(new_question_contract_manager.questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(new_question_contract_manager.questions, 1, 'questions should contain 1 address');

      let result2 = await new_question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that second result address is in questions
      assert.isOk(new_question_contract_manager.questions.includes(result2), 'questions array should contain new question address');
      assert.lengthOf(new_question_contract_manager.questions, 2, 'questions should contain 2 addresses');
    });

    it("should have correct question data at stored address", async function() {
      let new_question_contract_manager = await QuestionContractManager.new();
      let result = await new_question_contract_manager.SubmitQuestion("questiontext", ["tag1", "tag2"], 2017, 500, 1000, 28, 20, {value: 1020, from: accounts[0]});
      //check that stored address is in questions
      let questionContract = Question.at(new_question_contract_manager.questions[0]);
      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(questionContract.questiontext, "questiontext");
      assert.equal(questionContract.tags, ["tag1", "tag2"]);
      assert.equal(questionContract.submittedTime, 2017);
      assert.equal(questionContract.bounty.minValue, 500);
      assert.equal(questionContract.bounty.maxValue, 1000);
      assert.equal(questionContract.bounty.timeToMaxValue, 28);
    });
  }); 
});
