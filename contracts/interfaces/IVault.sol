// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

interface IVault {
    function originalOwner(uint256 tokenId) external view returns(address);
}