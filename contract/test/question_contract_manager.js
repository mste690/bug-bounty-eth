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
    getDefaultValues = () => ({
      questionText: 'questionText',
      tags: [ 'tag1', 'tag2' ],
      submittedTime: 1514786491,
      bountyMinValue: 500,
      bountyMaxValue: 1000,
      bountyTimeToMaxValue: 24 * 60 * 60,
      tip: 20,
      transactionObject: {
        value: 1020
      }
    })

    submitQuestionPromise = (qcm, values) =>
      qcm.SubmitQuestion(
          values.questionText,
          values.tags,
          values.submittedTime,
          values.bountyMinValue,
          values.bountyMaxValue,
          values.bountyTimeToMaxValue,
          values.tip,
          values.transactionObject)

    getCreatedQuestionContractAddress = (qcmContractInstance) => new Promise((resolve, reject) => {
      //Get logs for QuestionSubmitted event for the question contract manager instance
      qcmContractInstance.QuestionSubmitted({}).get((error, logs) => {
        if(error) {
          reject(error);
        }

        //we only want the latest event
        lastLog = logs[logs.length-1];

        //return the address of the question contract created
        resolve(lastLog.args.questionAddress);
      });
    });

    mapTagBytesToStrings = (tagsAsBytes) => tagsAsBytes.map((bytes) => web3.toAscii(bytes)
        .replace(/\0/g, ''));

    it('should not fail with valid input', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
    });

    it('should fail if questionText is an empty string', async () => {
      let values = getDefaultValues();
      values.questionText = '';
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if questionText is longer than the maximum character length', async () => {
      const MAX_CHARS = 2048;
      let longString = '';
      for (let i = 0; i <= MAX_CHARS; i++) {
        longString += 'a';
      }

      let values = getDefaultValues();
      values.questionText = longString;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the list of tags contains an empty string', async () => {
      let values = getDefaultValues();
      values.tags[0] = '';
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should not fail if the list of tags contains exactly the maximum number of allowed tags', async () => {
      const MAX_TAGS = 10;
      let tags = [];
      for (let i = 0; i < MAX_TAGS; i++) {
        tags.push(`tag ${i}`);
      }

      let values = getDefaultValues();
      values.tags = tags;
      await submitQuestionPromise(question_contract_manager, values);
    });

    it('should fail if the list of tags contains more than the maximum number of allowed tags', async () => {
      const MAX_TAGS = 10;
      let tags = [];
      for (let i = 0; i <= MAX_TAGS; i++) {
        tags.push(`tag ${i}`);
      }

      let values = getDefaultValues();
      values.tags = tags;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the list of tags contains duplicate tags', async () => {
      let values = getDefaultValues();
      values.tags = ['tag1', 'tag1'];
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bountyMinValue is 0', async () => {
      let values = getDefaultValues();
      values.bountyMinValue = 0;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bountyMinValue is negative', async () => {
      let values = getDefaultValues();
      values.bountyMinValue = -1;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bountyMinValue is greater than bountyMaxValue', async () => {
      let values = getDefaultValues();
      values.bountyMinValue = values.bountyMaxValue + 1;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the value given to the contract is less than to the bountyMaxValue plus the tip', async () => {
      let values = getDefaultValues();
      values.transactionObject = {
        value: values.bountyMaxValue + values.tip - 1
      };
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the value given to the contract is greater than to the bountyMaxValue plus the tip', async () => {
      let values = getDefaultValues();
      values.transactionObject = {
        value: values.bountyMaxValue + values.tip + 1
      };
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bounty timeToMaxValue is negative', async () => {
      let values = getDefaultValues();
      values.bountyTimeToMaxValue = -1;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bounty timeToMaxValue is greater than bountyTimeToMaxValue days', async () => {
      const TWENTY_EIGHT_DAYS = 28 * 24 * 60 * 60;
      let values = getDefaultValues();
      values.bountyTimeToMaxValue = TWENTY_EIGHT_DAYS + 1;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should fail if the bounty tip is less than 1% of the bounty max value', async () => {
      let values = getDefaultValues();
      values.tip = (values.bountyMaxValue / 100) -1;
      await expectTransactionToFail(submitQuestionPromise(question_contract_manager, values));
    });

    it('should return address to question contract', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check the result is a valid ethereum address
      assert.isOk(web3.isAddress(result), 'SubmitQuestion did not return valid ethereum address');
      const questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(await questionContract.questionText.call(), getDefaultValues().questionText);
    });

    it('should create Question contract with correct inputs', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the instantiated contract has a questiontext field that matches the input

      assert.equal(await questionContract.questionText.call(), getDefaultValues().questionText);
      assert.deepEqual(mapTagBytesToStrings(await questionContract.getTags.call()), getDefaultValues().tags);
      assert.equal(await questionContract.submittedTime.call(), getDefaultValues().submittedTime);
      const bounty = await questionContract.bounty.call();
      assert.equal(bounty[0], getDefaultValues().bountyMinValue);
      assert.equal(bounty[1], getDefaultValues().bountyMaxValue);
      assert.equal(bounty[2], getDefaultValues().bountyTimeToMaxValue);
    });

    it('should have Question author as message sender', async () => {
      let values = getDefaultValues();
      values.transactionObject.from = accounts[0]
      await submitQuestionPromise(question_contract_manager, values);
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the author is the message sender
      assert.equal(await questionContract.author.call(), accounts[0]);
    });

    it('should have same Question contract balance as max bounty', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check that the result contract balance is bounty maxValue
      assert.equal(web3.eth.getBalance(result), getDefaultValues().bountyMaxValue);
    });

    it('should increase the owners account balance by the tip amount', async () => {
      const new_question_contract_manager = await QuestionContractManager.new({from: accounts[0]});

      const initialBalance = web3.eth.getBalance(accounts[0]);
      let values = getDefaultValues();
      values.transactionObject.from = accounts[1]
      await submitQuestionPromise(new_question_contract_manager, values);
      //check that the result contract balance is bounty maxValue
      assert.deepEqual(web3.eth.getBalance(accounts[0]), initialBalance.plus(getDefaultValues().tip));
    });

    it('should have Question isClosed as false', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      const questionContract = Question.at(result);
      //check that the author is the message sender
      assert.isFalse(await questionContract.isClosed.call(), 'Question isClosed should be false on submission');
    });

    it('should have Question address in managers questions array', async () => {
      await submitQuestionPromise(question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(question_contract_manager);
      //check that result address is in questions
      const questions = await question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
    });

    it('should have no questions for new contract manager', async () => {
      const new_question_contract_manager = await QuestionContractManager.new();
      const questions = await new_question_contract_manager.getQuestions.call();
      assert.equal(questions.length, 0, 'New manager should have no questions');
    });

    it('should have single address in new manager after submit', async () => {
      const new_question_contract_manager = await QuestionContractManager.new();
      await submitQuestionPromise(new_question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(new_question_contract_manager);
      
      //check that result address is in questions
      const questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(questions, 1, 'questions should contain 1 address');
    });

    it('should have two addresses in new manager after two submissions', async () => {
      const new_question_contract_manager = await QuestionContractManager.new();
      await submitQuestionPromise(new_question_contract_manager, getDefaultValues());
      const result = await getCreatedQuestionContractAddress(new_question_contract_manager);

      //check that result address is in questions
      let questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result), 'questions array should contain new question address');
      assert.lengthOf(questions, 1, 'questions should contain 1 address');

      await submitQuestionPromise(new_question_contract_manager, getDefaultValues());
      const result2 = await getCreatedQuestionContractAddress(new_question_contract_manager);
      
      //check that second result address is in questions
      questions = await new_question_contract_manager.getQuestions.call();
      assert.isOk(questions.includes(result2), 'questions array should contain new question address');
      assert.lengthOf(questions, 2, 'questions should contain 2 addresses');
    });

    it('should have correct question data at stored address', async () => {
      const new_question_contract_manager = await QuestionContractManager.new();
      await submitQuestionPromise(new_question_contract_manager, getDefaultValues());      
      //check that stored address is in questions
      const questions = await new_question_contract_manager.getQuestions.call();
      const questionContract = Question.at(questions[0]);

      //check that the instantiated contract has a questiontext field that matches the input
      assert.equal(await questionContract.questionText.call(), getDefaultValues().questionText);
      assert.deepEqual(mapTagBytesToStrings(await questionContract.getTags.call()), getDefaultValues().tags);
      assert.equal(await questionContract.submittedTime.call(), getDefaultValues().submittedTime);
      
      const bounty = await questionContract.bounty.call();
      assert.equal(bounty[0], getDefaultValues().bountyMinValue);
      assert.equal(bounty[1], getDefaultValues().bountyMaxValue);
      assert.equal(bounty[2], getDefaultValues().bountyTimeToMaxValue);
    });
  }); 
});
