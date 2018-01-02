pragma solidity ^0.4.4;

contract Question {

  address public author;
  string public questionText;
  bytes32[] public tags;
  Bounty public bounty;
  uint public submittedTime;
  bool public isClosed;

  struct Bounty {
    uint minValue;
    uint maxValue;
    uint timeToMaxValue;
  }

  //Getter for tags
  function getTags() public view returns (bytes32[]) {
    return tags;
  }

  function Question(
      address _author,
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

  //fallback receiver function for receiving bounty
  function() public payable {

  }

}
