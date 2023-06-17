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
    mapping(address => uint256) public debts;
    mapping(uint256 => uint256) public tokenTimeStaked;

    uint256 public LtV = 75;

    //events
    event NFTDeposit(address indexed from, address indexed to, uint256 tokenId);
    event NFTWithdraw(address indexed tokenOwner, uint256 tokenId);
    event BorrowAgainstNFT(address indexed tokenOwner, uint256 tokenId, uint256 borrowAmount);
    event RepayDebt(address indexed tokenOwner, uint256 tokenId, uint256 borrowAmount);

    constructor(address _raacAddress) payable {
        raacInterface = IERC721(_raacAddress);
    }

    function stakeNFT(uint256 tokenId) external {
        raacInterface.safeTransferFrom(msg.sender, address(this), tokenId);
        emit NFTDeposit(msg.sender, address(this), tokenId);
    }

    function withdrawNFT(uint256 tokenId) external {
        require(originalOwner[tokenId] == msg.sender, "Non-token owner can't withdraw");
        require(debts[msg.sender] == 0, "Can't withdraw with outstanding debt");

        raacInterface.safeTransferFrom(address(this), msg.sender, tokenId);
        originalOwner[tokenId] = address(0);

        emit NFTWithdraw(msg.sender, tokenId);
    }

    function borrow(uint256 tokenId) external returns(uint256) {
        //check token owner and debts mapping
        require(originalOwner[tokenId] == msg.sender, "Non-token owner can't borrow");
        require(debts[msg.sender] == 0, "Unable to borrow, loan already taken");

        //calculate borrow amount
        uint256 amount = 20 ether;

        //update debts mapping
        debts[msg.sender] += amount;

        //transfer borrowed funds to user
        (bool success, ) = payable(msg.sender).call{value: amount}("");

        if(!success) {
            revert RAACVault__BorrowFailed();
        }
        emit BorrowAgainstNFT(msg.sender, tokenId, amount);
        return amount;
    }

    function repay(uint256 tokenId) external payable returns(uint256) {
        require(debts[msg.sender] > 0, "Nothing to repay");
        require(msg.value > 0, "Zero eth sent");

        uint256 amountRepay = debts[msg.sender];
        require(msg.value == amountRepay, "Must send exact amount of eth");

        debts[msg.sender] = 0;
        emit RepayDebt(msg.sender, tokenId, amountRepay);
        return amountRepay;
    }

    function getContractBalance() public view onlyOwner returns(uint256) {
        return address(this).balance;
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