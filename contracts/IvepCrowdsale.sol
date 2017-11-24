pragma solidity ^0.4.15;
import './Owned.sol';
import './TKLNToken.sol';

contract IvepCrowdsale is Owned, CrowdsaleParameters {
    /* ICO and Pre-ICO Parameters */
    address private saleWalletAddress;
    address private presaleWalletAddress;
    uint private tokenMultiplier = 10;
    bool private allowRefunds = false;
    uint[] public ICOStagePeriod; // Array of stage timestamps in Unix epoch seconds
    uint public ICOGoal;

    /* Token and records */
    TKLNToken private token;
    uint public totalCollected = 0;
    mapping (address => uint256) private investmentRecords;

    /* Events */
    event TokenSale(address indexed tokenReceiver, uint indexed etherAmount, uint indexed tokenAmount, uint tokensPerEther);
    event FundTransfer(address indexed from, address indexed to, uint indexed amount);
    event Refund(address indexed backer, uint amount);
    event Debug(string message);
    event Debug1(uint number);

    enum Stage { PreSale, GeneralSale, Inactive }

    /**
    * Constructor
    *
    * @param _tokenAddress - address of token (deployed before this contract)
    */
    function IvepCrowdsale(address _tokenAddress) public {
        token = TKLNToken(_tokenAddress);
        tokenMultiplier = tokenMultiplier ** token.decimals();
        presaleWalletAddress = CrowdsaleParameters.presaleWallet.addr;
        saleWalletAddress = CrowdsaleParameters.generalSaleWallet.addr;

        ICOStagePeriod.push(CrowdsaleParameters.presaleStartDate);
        ICOStagePeriod.push(CrowdsaleParameters.presaleEndDate);
        ICOStagePeriod.push(CrowdsaleParameters.generalSaleStartDate);
        ICOStagePeriod.push(CrowdsaleParameters.generalSaleEndDate);

        // Initialize ICO goal
        ICOGoal = CrowdsaleParameters.generalSaleWallet.amount + CrowdsaleParameters.presaleWallet.amount;
    }

    /**
    * Get active stage (pre-sale or general sale)
    *
    * @return stage - active stage
    */
    function getActiveStage() internal constant returns (Stage) {
        if(ICOStagePeriod[0] <= now && now < ICOStagePeriod[1])
            return Stage.PreSale;

        if(ICOStagePeriod[2] <= now && now < ICOStagePeriod[3])
            return Stage.GeneralSale;

        return Stage.Inactive;
    }

    /**
    * Is (pre)sale active
    *
    * @return active - True, if sale is active
    */
    function isICOActive() public constant returns (bool active) {
        active = (getActiveStage() != Stage.Inactive);
        return active;
    }

    /**
    *  Process received payment
    *
    *  Determine the integer number of tokens that was purchased considering current
    *  stage, tier bonus, and remaining amount of tokens in the sale wallet.
    *  Transfer purchased tokens to bakerAddress and return unused portion of
    *  ether (change)
    *
    * @param bakerAddress - address that ether was sent from
    * @param amount - amount of Wei received
    */
    function processPayment(address bakerAddress, uint amount) internal {
        // Check current stage, either pre-sale or general sale should be active
        Stage currentStage = getActiveStage();
        require(currentStage != Stage.Inactive);

        // Before Metropolis update require will not refund gas, but
        // for some reason require statement around msg.value always throws
        assert(msg.value > 0 finney);

        // Tell everyone about the transfer
        FundTransfer(bakerAddress, address(this), amount);

        // Calculate tokens per ETH for this tier
        uint tokensPerEth = 16500;

        if (amount < 3 ether)
            tokensPerEth = 15000;
        else if (amount < 7 ether)
            tokensPerEth = 15150;
        else if (amount < 15 ether)
            tokensPerEth = 15300;
        else if (amount < 30 ether)
            tokensPerEth = 15450;
        else if (amount < 75 ether)
            tokensPerEth = 15600;
        else if (amount < 150 ether)
            tokensPerEth = 15750;
        else if (amount < 250 ether)
            tokensPerEth = 15900;
        else if (amount < 500 ether)
            tokensPerEth = 16050;
        else if (amount < 750 ether)
            tokensPerEth = 16200;
        else if (amount < 1000 ether)
            tokensPerEth = 16350;

        if (currentStage == Stage.PreSale)
            tokensPerEth = tokensPerEth * 2;

        // Calculate token amount that is purchased,
        // truncate to integer
        uint tokenAmount = amount * tokensPerEth / 1e18;

        // Check that stage wallet has enough tokens. If not, sell the rest and
        // return change.
        address tokenSaleWallet = currentStage == Stage.PreSale ? presaleWalletAddress : saleWalletAddress;
        uint remainingTokenBalance = token.balanceOf(tokenSaleWallet) / tokenMultiplier;
        if (remainingTokenBalance < tokenAmount) {
            tokenAmount = remainingTokenBalance;
        }

        // Calculate Wei amount that was received in this transaction
        // adjusted to rounding and remaining token amount
        uint acceptedAmount = tokenAmount * 1e18 / tokensPerEth;

        // Transfer tokens to baker and return ETH change
        token.transferFrom(tokenSaleWallet, bakerAddress, tokenAmount * tokenMultiplier);
        TokenSale(bakerAddress, amount, tokenAmount * tokenMultiplier, tokensPerEth);

        // Return change
        uint change = amount - acceptedAmount;
        if (change > 0) {
            if (bakerAddress.send(change)) {
                FundTransfer(address(this), bakerAddress, change);
            }
            else revert();
        }

        // Update crowdsale performance
        investmentRecords[bakerAddress] += acceptedAmount;
        totalCollected += acceptedAmount;
    }

    /**
    * Allow or disallow refunds
    *
    * @param value - if true, refunds will be allowed; if false, disallowed
    */
    function setAllowRefunds(bool value) external onlyOwner {
        require(getActiveStage() == Stage.Inactive);

        allowRefunds = value;
    }

    /**
    *  Transfer ETH amount from contract to owner's address.
    *  Can only be used if ICO is closed
    *
    * @param amount - ETH amount to transfer in Wei
    */
    function safeWithdrawal(uint amount) external onlyOwner {
        require(this.balance >= amount);
        require(getActiveStage() == Stage.Inactive);

        if (owner.send(amount)) {
            FundTransfer(0, msg.sender, amount);
        }
    }

    /**
    *  Default method
    *
    *  Processes all ETH that it receives and credits TKLN tokens to sender
    *  according to current stage bonus
    */
    function () external payable {
        processPayment(msg.sender, msg.value);
    }

    /**
    *  Set a new owner for Token contract
    *
    * @param _owner - address of new owner
    */
    function changeTokenOwner(address _owner) public onlyOwner {
        if(token.owner() != _owner)
            token.changeOwner(_owner);
    }

    /**
    *  Kill method
    *
    *  Destructs this contract
    */
    function kill() external onlyOwner {
        require(getActiveStage() == Stage.Inactive);
        if(this.balance > 0) {
            owner.transfer(this.balance);
        }
        changeTokenOwner(owner);
        selfdestruct(owner);
    }

    /**
    *  Refund
    *
    *  Sends a partial refund to the sender who calls this method.
    *  Fraction of collected amount will not be refunded
    */
    function refund() external {
        require((getActiveStage() == Stage.Inactive)
            && allowRefunds
            && investmentRecords[msg.sender] > 0);

        var amountToReturn = investmentRecords[msg.sender];

        require(this.balance >= amountToReturn);

        msg.sender.transfer(amountToReturn);
        investmentRecords[msg.sender] = 0;
        Refund(msg.sender, amountToReturn);
    }
}
