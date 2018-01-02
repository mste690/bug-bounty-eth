pragma solidity ^0.4.4;

contract Question {

  uint author;
  string questionText;
  bytes32[] tags;
  Bounty bounty;
  uint submittedTime;
  bool isClosed;

  struct Bounty {
    uint minValue;
    uint maxValue;
    uint timeToMaxValue;
  }

  function Question(
      uint _author,
      string _questionText,
      bytes32[] _tags,
      uint _submittedTime,
      uint _bountyMinValue,
      uint _bountyMaxValue,
      uint _bountyTimeToMaxValue
  )
      public
  {
    author = _author;
    questionText = _questionText;
    tags = _tags;
    bounty = Bounty(_bountyMinValue, _bountyMaxValue, _bountyTimeToMaxValue);
    submittedTime = _submittedTime;
    isClosed = false;
  }

}
