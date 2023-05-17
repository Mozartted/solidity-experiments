// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "./interfaces/Uniswap.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestUniswap {
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    // address private constant UNISWAP_V2_ROUTER =
    //     0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private fee_address;

    constructor(address _fee_address) {
        fee_address = _fee_address;
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
        require(
            (_amountIn / 10000) * 10000 == _amountIn,
            "amount in is too small"
        );
        // calculate the fee
        uint256 feeValue = (_amountIn * 80) / 10000;
        uint256 amountValue = _amountIn - feeValue;
        IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, amountValue);
        IERC20(_tokenIn).transfer(fee_address, feeValue);
        // IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, _amountIn);
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
}
