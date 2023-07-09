// Interface to interact with RAACVault.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IVault {
    function originalOwner(uint256 tokenId) external view returns(address);
}