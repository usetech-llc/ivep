pragma solidity ^0.4.15;
import '../contracts/Owned.sol';
import '../contracts/DBNToken.sol';
import '../contracts/CrowdsaleParameters.sol';

contract DBNTokenStub is DBNToken {

    AddressTokenAllocation tokenAllocation;

    // Make it public
    function mint(address _addr, uint256 _amount, uint256 _vestingts) public {
        tokenAllocation = AddressTokenAllocation(_addr, _amount, _vestingts);
        super.mintToken(tokenAllocation);
    }
}
