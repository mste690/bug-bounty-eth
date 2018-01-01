var Migrations = artifacts.require("./Migrations.sol");
var QuestionContractManager = artifacts.require("./QuestionContractManager.sol");
var Question = artifacts.require("./Question.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(QuestionContractManager);
  deployer.deploy(Question);
};
