// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// General Errors
error RAACVault__StakeFailed();
error RAACVault__WithdrawFailed();
error RAACVault__BorrowFailed();
error RAACVault__RepayFailed();

// Chainlink Errors

contract RAACVault is Ownable, IERC721Receiver {
    //Chainlink variables

    //token interface for RAAC NFTs
    IERC721 public raacInterface;

    //storage variables
    mapping(uint256 => address) public originalOwner;

    //events
    event NFTDeposit(address indexed from, address indexed to, uint256 indexed tokenId);

    constructor(address _raacAddress) payable {
        raacInterface = IERC721(_raacAddress);
    }

    function stakeNFT(uint256 tokenId) external {
        raacInterface.safeTransferFrom(msg.sender, address(this), tokenId);
        emit NFTDeposit(msg.sender, address(this), tokenId);
    }

    function withdrawNFT(uint256 tokenId) external {
        require(originalOwner[tokenId] == msg.sender);
        raacInterface.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        originalOwner[tokenId] = from;
        return IERC721Receiver.onERC721Received.selector;
    }
}