// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./interfaces/ICurve.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IConvex.sol";
import "./interfaces/IConvexRewards.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RAACCurveStrategy {
    using SafeERC20 for IERC20;

    ICurve public curveInterface;
    IERC721 public nftInterface;
    IERC20 public tokenInterface;
    IVault public vaultInterface;
    IConvex public convexInterface;
    IConvexRewards public convexRewardsInterface;

    // Tokens
    address public dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public usdc = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public usdt = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    // Curve
    address public curvePool = 0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7;
    address public curveLpToken = 0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490;

    //Convex
    address public convexPool = 0xF403C135812408BFbE8713b5A23a04b3D48AAE31;
    address public convexReward = 0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8;
    uint256 public constant convexPoolId = 9;

    mapping(address => bool) public loanTaken;
    mapping(address => uint256) public loanAmounts;

    address[] public TOKENS = [dai,usdc,usdt];

    //events
    event AddLiquidity(address indexed sender, uint256[3] amounts);

    constructor(address _vaultAddress, address _nftAddress) {
        curveInterface = ICurve(curvePool);
        tokenInterface = IERC20(curveLpToken);
        nftInterface = IERC721(_nftAddress);
        vaultInterface = IVault(_vaultAddress);
        convexInterface = IConvex(convexPool);
        convexRewardsInterface = IConvexRewards(convexReward);
    }

    function add(uint256 tokenId) external {
        // TWO conditions must be met
        // 1st: token must be owned by vault
        // 2nd: caller must be original owner of the token (OR ELSE ANYONE CAN CALL!)
        require(nftInterface.ownerOf(tokenId) == address(vaultInterface), "VAULT DOES NOT OWN THIS TOKEN");
        require(msg.sender == getOriginalOwner(tokenId), "YOU MUST BE ORIGINAL OWNER!");

        // get amounts to send to curve pool
        uint256[3] memory amounts = [uint256(0),0,0];

        for(uint256 i=0;i<TOKENS.length;i++){
            amounts[i] = IERC20(TOKENS[i]).balanceOf(address(this));

            if(amounts[i] > 0)
                _safeApprove(TOKENS[i], curvePool, amounts[i]); // approve curve to spend tokens
        }

        loanTaken[msg.sender] = true;
        //loanAmounts[msg.sender] = (amounts[0]) + (amounts[1]) + (amounts[2]);
        loanAmounts[msg.sender] = ((amounts[0]) + (amounts[1] * 1e12) + (amounts[2] * 1e12));

        // interact with curve pool
        curveInterface.add_liquidity(amounts, uint256(1));
        emit AddLiquidity(msg.sender, amounts);
    }

    function getOriginalOwner(uint256 tokenId) public view returns(address) {
        return vaultInterface.originalOwner(tokenId);
    }

    function _safeApprove(address token, address spender, uint256 amount) internal {
        bytes memory data = abi.encodeWithSignature("approve(address,uint256)", spender, amount);
        (bool success, bytes memory returnData) = token.call(data);
        require(success && (returnData.length == 0 || abi.decode(returnData, (bool))), "Safe approve failed");
    }
}