pragma solidity ^0.4.4;

import "./Question.sol";

contract QuestionContractManager {

  uint public constant MAX_QUESTION_TEXT_LENGTH = 2048;
  uint public constant MAX_TAGS = 10;
  uint public constant MAX_TAG_TEXT_LENGTH = 32;

  address[] internal questions;
  
  function QuestionContractManager() {
    //constructor
  }

  //question getter
  function getQuestions() public returns(address[]) {
    return questions;
  }
  
  function SubmitQuestion(string questionText, bytes32[] tags, uint submittedTime, uint bountyMinValue, uint bountyMaxValue, uint bountyTimeToMaxValue, uint tip) public payable returns(address) { 
    require(bytes(questionText).length > 0);
    require(bytes(questionText).length <= MAX_QUESTION_TEXT_LENGTH);
    require(tags.length < MAX_TAGS);

    bytes32[] memory seenTags = new bytes32[](10);
    for (uint i = 0; i < tags.length; i++) {
      uint tagLength = tags[i].length;
      require(tagLength > 0);
      require(tagLength <= MAX_TAG_TEXT_LENGTH);

      //check for duplicates
      for(uint j = 0; j < seenTags.length; j++) {
        require(tags[i] != seenTags[j]);
      }

      seenTags[i] = tags[i];
    }

    require(bountyMinValue > 0);
    require(bountyMinValue <= bountyMaxValue);
    require(msg.value == bountyMaxValue + tip);
    require(bountyTimeToMaxValue >= 0);
    require(bountyTimeToMaxValue <= 28 days);
    require(tip >= bountyMaxValue/100);

    address newQuestionContract = new Question();
    questions.push(newQuestionContract);
    return newQuestionContract;
  }
}
