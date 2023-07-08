//main Convex contract(booster.sol) basic interface
interface IConvex{
    //deposit into convex, receive a tokenized deposit.  parameter to stake immediately
    function deposit(uint256 _pid, uint256 _amount, bool _stake) external returns(bool);
    //burn a tokenized deposit to receive curve lp tokens back
    function withdraw(uint256 _pid, uint256 _amount) external returns(bool);
}