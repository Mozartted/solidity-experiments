const ForwardPayer = artifacts.require("ForwarderPayer");

module.exports = function (deployer) {
  deployer.deploy(ForwardPayer);
};
