const SomeCoin = artifacts.require('SomeCoin')

module.exports = function (deployer) {
  deployer.deploy(SomeCoin)
}
