pragma solidity ^0.4.15;
import './Owned.sol';
import './CrowdsaleParameters.sol';

contract IVEPToken is Owned, CrowdsaleParameters {

    /* Public variables of the token */
    string public standard = 'Token 0.1';
    string public name = 'Ivep';
    string public symbol = 'DBN';
    uint8 public decimals = 18;

    /* Arrays of all balances, vesting, approvals, and approval uses */
    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private allowed;
    mapping (address => mapping (address => bool)) private allowanceUsed;
    mapping (address => mapping (uint256 => uint256)) public vestingBalanceOf;
    uint[] private vestingTimes;
    mapping (address => uint) private vestingTimesForPools;

    /* This generates a public event on the blockchain that will notify clients */
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Transfer(address indexed spender, address indexed from, address indexed to, uint256 value);
    event VestingTransfer(address indexed from, address indexed to, uint256 value, uint256 vestingTime);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Issuance(uint256 _amount); // triggered when the total supply is increased
    event Destruction(uint256 _amount); // triggered when the total supply is decreased
    event NewTKLNToken(address _token);

    /* Unique baker addresses counting feature */
    address[] public addressByIndex;
    mapping (address => bool) private addressAddedToIndex;

    /* Miscellaneous */
    uint256 public totalSupply = 0; // Total tokens minted: 1,000,000,000
    bool public transfersEnabled = true;

    /**
    *  Constructor
    *
    *  Initializes contract with initial supply tokens to the creator of the contract
    */
    function IVEPToken() public {
        owner = msg.sender;

        mintToken(presaleWallet);
        mintToken(generalSaleWallet);
        mintToken(wallet1);
        mintToken(wallet2);
        mintToken(wallet3);
        mintToken(wallet4);
        mintToken(wallet5);
        mintToken(wallet6);
        mintToken(foundersWallet);
        mintToken(wallet7);
        mintToken(wallet8genesis);
        mintToken(wallet9);
        mintToken(wallet10);
        mintToken(wallet11bounty);
        mintToken(wallet12);
        mintToken(wallet13rsv);
        mintToken(wallet14partners);
        mintToken(wallet15lottery);

        NewTKLNToken(address(this));
    }

    modifier transfersAllowed {
        require(transfersEnabled);
        _;
    }

    modifier onlyPayloadSize(uint size) {
        assert(msg.data.length == size + 4);
        _;
    }

    /**
    *  1. Associate crowdsale contract address with this Token
    *  2. Allocate presale and general sale amounts
    *  3. Allocate all other amounts (such as early adopters' pool, reserve,
    *     strategic partners and bounty/promotions)
    *
    * @param _crowdsaleAddress - crowdsale contract address
    */
    function approveForCrowdsale(address _crowdsaleAddress) public onlyOwner {
        approveAllocation(presaleWallet, _crowdsaleAddress);
        approveAllocation(generalSaleWallet, _crowdsaleAddress);
        approveAllocation(wallet1, _crowdsaleAddress);
        approveAllocation(wallet2, _crowdsaleAddress);
        approveAllocation(wallet3, _crowdsaleAddress);
        approveAllocation(wallet4, _crowdsaleAddress);
        approveAllocation(wallet5, _crowdsaleAddress);
        approveAllocation(wallet6, _crowdsaleAddress);
        approveAllocation(foundersWallet, _crowdsaleAddress);
        approveAllocation(wallet7, _crowdsaleAddress);
        approveAllocation(wallet8genesis, _crowdsaleAddress);
        approveAllocation(wallet9, _crowdsaleAddress);
        approveAllocation(wallet10, _crowdsaleAddress);
        approveAllocation(wallet11bounty, _crowdsaleAddress);
        approveAllocation(wallet12, _crowdsaleAddress);
        approveAllocation(wallet13rsv, _crowdsaleAddress);
        approveAllocation(wallet14partners, _crowdsaleAddress);
        approveAllocation(wallet15lottery, _crowdsaleAddress);
    }

    function approveAllocation(AddressTokenAllocation tokenAllocation, address _crowdsaleAddress) internal {
        uint uintDecimals = decimals;
        uint exponent = 10**uintDecimals;
        uint amount = tokenAllocation.amount * exponent;

        allowed[tokenAllocation.addr][_crowdsaleAddress] = amount;
        Approval(tokenAllocation.addr, _crowdsaleAddress, amount);
    }

    /**
    *  Get token balance of an address
    *
    * @param _address - address to query
    * @return Token balance of _address
    */
    function balanceOf(address _address) public constant returns (uint256 balance) {
        return balances[_address];
    }

    /**
    *  Get vested token balance of an address
    *
    * @param _address - address to query
    * @return balance that has vested
    */
    function vestedBalanceOf(address _address) public constant returns (uint256 balance) {
        return balances[_address] - vestingBalanceOf[_address][0];
    }

    /**
    *  Get token amount allocated for a transaction from _owner to _spender addresses
    *
    * @param _owner - owner address, i.e. address to transfer from
    * @param _spender - spender address, i.e. address to transfer to
    * @return Remaining amount allowed to be transferred
    */
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    /**
    *  Send coins from sender's address to address specified in parameters
    *
    * @param _to - address to send to
    * @param _value - amount to send in Wei
    */
    function transfer(address _to, uint256 _value) public transfersAllowed onlyPayloadSize(2*32) returns (bool success) {
        checkMyVesting(msg.sender);

        require(vestedBalanceOf(msg.sender) >= _value);

        // Subtract from the sender
        // _value is never greater than balance of input validation above
        balances[msg.sender] -= _value;

        if (vestingTimesForPools[msg.sender] > 0 && vestingTimesForPools[msg.sender] > now) {
            addToVesting(msg.sender, _to, vestingTimesForPools[msg.sender], _value);
        }

        // Overflow is never possible due to input validation above
        balances[_to] += _value;

        addIndex(_to);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
    *  Create token and credit it to target address
    *  Created tokens need to vest
    *
    */
    function mintToken(AddressTokenAllocation tokenAllocation) internal {
        // Add Vesting Times
        addVestingTimesForPool(tokenAllocation.addr, tokenAllocation.vestingTS);
        addVestingTime(tokenAllocation.vestingTS);

        uint uintDecimals = decimals;
        uint exponent = 10**uintDecimals;
        uint mintedAmount = tokenAllocation.amount * exponent;

        balances[tokenAllocation.addr] += mintedAmount;

        totalSupply += mintedAmount;
        Issuance(mintedAmount);
        addIndex(tokenAllocation.addr);
        Transfer(this, tokenAllocation.addr, mintedAmount);
    }

    function addIndex(address _address) internal {
        if (!addressAddedToIndex[_address]) {
            addressAddedToIndex[_address] = true;
            addressByIndex.push(_address);
        }
    }

    /**
    *  Allow another contract to spend some tokens on your behalf
    *
    * @param _spender - address to allocate tokens for
    * @param _value - number of tokens to allocate
    * @return True in case of success, otherwise false
    */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_value == 0 || allowanceUsed[msg.sender][_spender] == false);

        allowed[msg.sender][_spender] = _value;
        allowanceUsed[msg.sender][_spender] = false;
        Approval(msg.sender, _spender, _value);

        return true;
    }

    /**
    *  Allow another contract to spend some tokens on your behalf
    *
    * @param _spender - address to allocate tokens for
    * @param _currentValue - current number of tokens approved for allocation
    * @param _value - number of tokens to allocate
    * @return True in case of success, otherwise false
    */
    function approve(address _spender, uint256 _currentValue, uint256 _value) public returns (bool success) {
        require(allowed[msg.sender][_spender] == _currentValue);
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
    *  A contract attempts to get the coins. Tokens should be previously allocated
    *
    * @param _to - address to transfer tokens to
    * @param _from - address to transfer tokens from
    * @param _value - number of tokens to transfer
    * @return True in case of success, otherwise false
    */
    function transferFrom(address _from, address _to, uint256 _value) public transfersAllowed onlyPayloadSize(3*32) returns (bool success) {
        checkMyVesting(_from);

        // Check if the sender has enough
        require(vestedBalanceOf(_from) >= _value);

        // Check allowed
        require(_value <= allowed[_from][msg.sender]);

        // Subtract from the sender
        // _value is never greater than balance because of input validation above
        balances[_from] -= _value;
        // Add the same to the recipient
        // Overflow is not possible because of input validation above
        balances[_to] += _value;

        // Deduct allocation
        // _value is never greater than allowed amount because of input validation above
        allowed[_from][msg.sender] -= _value;

        if (vestingTimesForPools[_from] > 0 && vestingTimesForPools[_from] > now) {
            addToVesting(_from, _to, vestingTimesForPools[_from], _value);
        }

        addIndex(_to);
        Transfer(msg.sender, _from, _to, _value);
        allowanceUsed[_from][msg.sender] = true;

        return true;
    }

    /**
    *  Default method
    *
    *  This unnamed function is called whenever someone tries to send ether to
    *  it. Just revert transaction because there is nothing that Token can do
    *  with incoming ether.
    */
    function() public {
        revert();
        // Prevents accidental sending of ether
    }

    function countAddresses() public constant returns (uint256 length) {
        return addressByIndex.length;
    }

    /**
    *  Enable or disable transfers
    *
    * @param _enable - True = enable, False = disable
    */
    function toggleTransfers(bool _enable) public onlyOwner {
        transfersEnabled = _enable;
    }

    /**
    *  Destroy tokens
    *
    * @param _from - address to destroy tokens from
    * @param _amount - number of tokens to destroy
    */
    function destroy(address _from, uint256 _amount) public {
        checkMyVesting(msg.sender);
        // validate input
        require(msg.sender == _from || msg.sender == owner);
        require(vestedBalanceOf(_from) >= _amount);

        // _amount is never greater than balance because of validation above
        balances[_from] -= _amount;

        // _amount is never greater than total supply:
        // 1. Because of validation above, it is never greater than balances[_from]
        // 2. balances[_from] is never greater than total supply
        totalSupply -= _amount;

        Transfer(_from, this, _amount);
        Destruction(_amount);
    }

    function addVestingTime(uint256 time) internal {
        vestingTimes.push(time);
    }

    function addToVesting(address from, address target, uint256 vestingTime, uint256 amount) internal {
        vestingBalanceOf[target][0] += amount;
        vestingBalanceOf[target][vestingTime] += amount;
        VestingTransfer(from, target, amount, vestingTime);
    }

    function checkMyVesting(address sender) internal {
        if (vestingBalanceOf[sender][0] == 0) return;

        for (uint256 k = 0; k < vestingTimes.length; k++) {
            if (vestingTimes[k] < now) {
                vestingBalanceOf[sender][0] -= vestingBalanceOf[sender][vestingTimes[k]];
                vestingBalanceOf[sender][vestingTimes[k]] = 0;
            }
        }
    }

    function addVestingTimesForPool(address poolAddress, uint256 vestingTime) internal {
        vestingTimesForPools[poolAddress] = vestingTime;
    }
}
