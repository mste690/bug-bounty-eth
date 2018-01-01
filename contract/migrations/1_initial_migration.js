var Migrations = artifacts.require("./Migrations.sol");
var QuestionContractManager = artifacts.require("./QuestionContractManager.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(QuestionContractManager);
};
