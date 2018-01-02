const QuestionContractManager = artifacts.require('./QuestionContractManager.sol');
const Question = artifacts.require('./Question.sol');

contract('QuestionContractManager', (accounts) => {
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
    assert.fail('Tx did not fail', 'Tx should fail', 'Expected transaction to fail, but it did not');
  }

  describe('SubmitQuestion', () => {
    const defVals = {
      questionText: 'questiontext',
      tags: [ 'tag1', 'tag2' ],
      submittedTime: 1514786491,
      bountyMinValue: 500,
      bountyMaxValue: 1000,
      bountyTimeToMaxValue: 24 * 60 * 60,
      tip: 20,
      value: 1020,
      submitQuestionPromise:() => question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, { value: defVals.value })
    }

    getCreatedQuestionContractAddress = (contract) => new Promise((resolve, reject) => {
      contract.QuestionSubmitted({}).get((error, logs) => {
        if(error) {
          reject(error);
        }
        lastLog = logs[logs.length-1];
        resolve(lastLog.args.questionAddress);
      });
    });

    mapTagBytesToStrings = (tagsAsBytes) => tagsAsBytes.map((bytes) => web3.toAscii(bytes)
        .replace(/\0/g, ''));

    it('should not fail with valid input', async () => {
      await defVals.submitQuestionPromise();
    });

    it('should fail if questionText is an empty string', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion('', defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}))
    });

    it('should fail if questionText is longer than the maximum character length', async () =>{
      const MAX_CHARS = 2048;
      let longString = '';
      for (let i = 0; i <= MAX_CHARS; i++) {
        longString += 'a';
      }
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(longString, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the list of tags contains an empty string', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, ['tag1', ''], defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the list of tags contains more than the maximum number of allowed tags', async () =>{
      const MAX_TAGS = 10;
      let tags = [];
      for (let i = 0; i <= MAX_TAGS; i++) {
        tags.push(`tag ${i}`);
      }

      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the list of tags contains duplicate tags', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, ['tag1', 'tag1'], defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the bountyMinValue is 0', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, 0, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the bountyMinValue is negative', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, - 1, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the bountyMinValue is greater than bountyMaxValue', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMaxValue + 1, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the value given to the contract is less than to the bountyMaxValue plus the tip', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.bountyMaxValue + defVals.tip - 1}));
    });

    it('should fail if the value given to the contract is greater than to the bountyMaxValue plus the tip', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.bountyMaxValue + defVals.tip + 1}));
    });

    it('should fail if the bounty timeToMaxValue is negative', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, -5, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the bounty timeToMaxValue is greater than bountyTimeToMaxValue days', async () =>{
      
      const LONG_TIME = (defVals.bountyTimeToMaxValue * 24 * 60 * 60) + 1
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, LONG_TIME, defVals.tip, {value: defVals.value}));
    });

    it('should fail if the bounty tip is less than 1% of the bounty max value', async () =>{
      await expectTransactionToFail(question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.bountyMaxValue/100 - 1, {value: defVals.bountyMaxValue + defVals.bountyTimeToMaxValue/100 - 1}));
    });

    it('should return address to question contract', async () =>{
      await defVals.submitQuestionPromise();
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check the result is a valid ethereum address
      assert.isOk(web3.isAddress(result), 'SubmitQuestion did not return valid ethereum address');
      const questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(await questionContract.questionText.call(), defVals.questionText);
    });

    it('should create Question contract with correct inputs', async () =>{
      await defVals.submitQuestionPromise();
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input

      assert.equal(await questionContract.questionText.call(), defVals.questionText);
      assert.deepEqual(mapTagBytesToStrings(await questionContract.getTags.call()), defVals.tags);
      assert.equal(await questionContract.submittedTime.call(), defVals.submittedTime);
      const bounty = await questionContract.bounty.call();
      assert.equal(bounty[0], defVals.bountyMinValue);
      assert.equal(bounty[1], defVals.bountyMaxValue);
      assert.equal(bounty[2], defVals.bountyTimeToMaxValue);
    });

    it('should have Question author as message sender', async () =>{
      await question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[0]});
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the author is the message sender
      assert.equal(await questionContract.author.call(), accounts[0]);
    });

    it('should have same Question contract balance as max bounty', async () =>{
      await defVals.submitQuestionPromise();
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check that the result contract balance is bounty maxValue
      assert.equal(web3.eth.getBalance(result), defVals.bountyMaxValue);
    });

    it('should increase the owners account balance by the tip amount', async () =>{
      const new_question_contract_manager = await QuestionContractManager.new({from: accounts[0]});

      const initialBalance = web3.eth.getBalance(accounts[0]);
      await new_question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[1]});
      //check that the result contract balance is bounty maxValue
      assert.deepEqual(web3.eth.getBalance(accounts[0]), initialBalance.plus(defVals.tip));
    });

    it('should have Question isClosed as false', async () =>{
      await defVals.submitQuestionPromise();
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the author is the message sender
      assert.isFalse(await questionContract.isClosed.call(), 'Question isClosed should be false on submission');
    });

    it('should have Question address in managers questions array', async () =>{
      await defVals.submitQuestionPromise();
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check that result address is in questions
      const questions = await question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
    });

    it('should have no questions for new contract manager', async () =>{
      const new_question_contract_manager = await QuestionContractManager.new();
      const questions = await new_question_contract_manager.getQuestions.call();
      assert.equal(questions.length, 0, 'New manager should have no questions');
    });

    it('should have single address in new manager after submit', async () =>{
      const new_question_contract_manager = await QuestionContractManager.new();
      await new_question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[0]});
      const result = await getCreatedQuestionContractAddress(new_question_contract_manager);
      
      //check that result address is in questions
      const questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(questions, 1, 'questions should contain 1 address');
    });

    it('should have two addresses in new manager after two submissions', async () =>{
      const new_question_contract_manager = await QuestionContractManager.new();
      await new_question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[0]});
      const result = await getCreatedQuestionContractAddress(new_question_contract_manager);

      //check that result address is in questions
      let questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(questions, 1, 'questions should contain 1 address');

      await new_question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[0]});
      const result2 = await getCreatedQuestionContractAddress(new_question_contract_manager);
      
      //check that second result address is in questions
      questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result2), 'questions array should contain new question address');
      assert.lengthOf(questions, 2, 'questions should contain 2 addresses');
    });

    it('should have correct question data at stored address', async () =>{
      const new_question_contract_manager = await QuestionContractManager.new();
      await new_question_contract_manager.SubmitQuestion(defVals.questionText, defVals.tags, defVals.submittedTime, defVals.bountyMinValue, defVals.bountyMaxValue, defVals.bountyTimeToMaxValue, defVals.tip, {value: defVals.value, from: accounts[0]});
      
      //check that stored address is in questions
      const questions = await new_question_contract_manager.getQuestions.call();
      const questionContract = Question.at(questions[0]);

      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(await questionContract.questionText.call(), defVals.questionText);
      assert.deepEqual(mapTagBytesToStrings(await questionContract.getTags.call()), defVals.tags);
      assert.equal(await questionContract.submittedTime.call(), defVals.submittedTime);
      
      const bounty = await questionContract.bounty.call();
      assert.equal(bounty[0], defVals.bountyMinValue);
      assert.equal(bounty[1], defVals.bountyMaxValue);
      assert.equal(bounty[2], defVals.bountyTimeToMaxValue);
    });
  }); 
});
