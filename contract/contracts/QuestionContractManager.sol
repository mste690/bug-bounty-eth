pragma solidity ^0.4.4;

contract QuestionContractManager {
  
  address[] questions;
  
  function QuestionContractManager() {
    //constructor
  }
  
  function SubmitQuestion(string questionText, bytes32[] tags, uint submittedTime, uint bountyMinValue, uint bountyMaxValue, uint 
bountyTimeToMaxValue, uint tip) public payable returns(address) {
	//require(1 == 0);  
  }
}
