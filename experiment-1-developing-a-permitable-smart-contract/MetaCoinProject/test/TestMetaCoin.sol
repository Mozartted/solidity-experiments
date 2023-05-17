pragma solidity ^0.8.4;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MetaCoinWithPermit.sol";

contract TestMetaCoin {
    function testInitialBalanceUsingDeployedContract() public {
        MetaCoinWithPermit meta = MetaCoinWithPermit(
            DeployedAddresses.MetaCoinWithPermit()
        );

        uint256 expected = 10000;

        Assert.equal(
            meta.balanceOf(tx.origin),
            expected,
            "Owner should have 10000 MetaCoin initially"
        );
    }

    function testInitialBalanceWithNewMetaCoin() public {
        MetaCoinWithPermit meta = new MetaCoinWithPermit();

        uint256 expected = 10000;

        Assert.equal(
            meta.balanceOf(tx.origin),
            expected,
            "Owner should have 10000 MetaCoin initially"
        );
    }
}
