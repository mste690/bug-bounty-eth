pragma solidity ^0.4.4;

contract BugBountyEth {
  
  struct QuestionInput {
    string questionText;
    string[] tags;
    uint submittedTime;
    Bounty bounty;
    uint tip;
  }
  
  struct Bounty {
    minValue uint;
    maxValue uint;
    timeToMaxValue uint;
  }
  
  struct Question {
    address author;
    string id;
    string questionText;
    string[] tags;
    uint submittedTime;
    Bounty bounty;
    isAnswered bool;
  }

  function BugBountyEth() {
    // constructor
  }

  function SubmitQuestion(QuestionInput question) returns (string) {
    return "";
  }
}
