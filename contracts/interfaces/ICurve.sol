// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

interface ICurve {
    function get_virtual_price() external view returns (uint256);

    function add_liquidity(uint256[3] calldata, uint256) external;

    function balances(uint256 index) external view returns (uint256);

    function coins(uint256 _index) external view returns (address);
}