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
    uint maxvalue;
    uint timeToMaxValue;
  }

  function Question() {
    // constructor
  }

}
