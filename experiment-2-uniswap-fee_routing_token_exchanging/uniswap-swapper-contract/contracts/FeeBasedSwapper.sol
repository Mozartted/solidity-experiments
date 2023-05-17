// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "./interfaces/Uniswap.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract FeeBasedSwapper is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    // address private constant UNISWAP_V2_ROUTER =
    //     0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    address private fee_address;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _fee_address) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        fee_address = _fee_address;
    }

    function updateFeeAddress(address _fee_address) public onlyOwner {
        fee_address = _fee_address;
    }

    function feeAddress() public view returns (address) {
        return fee_address;
    }

    // swap tokens here
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _to
    ) external {
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        // send some of the tokens to an address for fee collector
        require(
            (_amountIn / 10000) * 10000 == _amountIn,
            "amount in is too small"
        );
        // calculate the fee
        uint256 feeValue = (_amountIn * 80) / 10000;
        uint256 amountValue = _amountIn - feeValue;
        IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, amountValue);

        // send token fee to an external address.
        IERC20(_tokenIn).transfer(fee_address, feeValue);
        address[] memory path = new address[](3);
        path[0] = _tokenIn;
        path[1] = WETH;
        path[2] = _tokenOut;

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountValue,
            _amountOutMin,
            path,
            _to,
            block.timestamp
        );
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
