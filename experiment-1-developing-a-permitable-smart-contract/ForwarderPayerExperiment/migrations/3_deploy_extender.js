const ExtendedForwarder = artifacts.require("ExtendedForwarder");

module.exports = function (deployer) {
  deployer.deploy(ExtendedForwarder);
};
