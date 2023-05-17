// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract MetaCoinWithPermit is ERC20, Ownable, ERC20Permit {
    constructor()
        ERC20("MetaCoinWithPermit", "MCP")
        ERC20Permit("MetaCoinWithPermit")
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
