pragma solidity ^0.4.4;

contract Question {
  
  uint author;
  string questionText;
  string[] tags;
  Bounty bounty;
  uint submittedTime;
  bool isClosed;
  
  struct Bounty {
    uint minValue;
    uint maxValue;
    uint timeToMaxValue;
  }

  function Question() {
    // constructor
  }

}

contract QuestionContractManager {
  
  address[] questions;
  
  function QuestionContractManager() {
    //constructor
  }
  
  function SubmitQuestion(string questionText, byte[512][] tags, uint submittedTime
      uint bountyMinValue, uint bountyMaxValue, uint bountyTimeToMaxValue, uint tip) public returns(address) {
  
  }
}
