const IvepCrowdsale = artifacts.require('./DBNCrowdsale.sol');
const IVEPToken = artifacts.require('./DBNToken.sol');

let IvepCrowdsaleStub = artifacts.require('./DBNCrowdsaleStub.sol');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function getLatestBlockCost (gasPrice = 0) {
  return web3.eth.getBlock('latest').gasUsed * gasPrice;
}

//  Defining crowdsale parameters-------------------------------------------------
//  This is actual parameters of crowdsale.
//  Edge cases should be tested on values set separately
//  token supply

const crowdsaleParams = {
  //  prices
  tokensPerEthPresale: 30000,
  tokensPerEthGeneral: 15000,
  //  dates
  presaleStartDate: new Date('2017-12-12T10:00+00:00').getTime() / 1000,
  presaleEndDate: new Date('2018-01-12T10:00+00:00').getTime() / 1000,
  generalSaleStartDate: new Date('2018-01-20T10:00+00:00').getTime() / 1000,
  generalSaleEndDate: new Date('2018-02-20T10:00+00:00').getTime() / 1000,
  //  misc
  weiInEth: 1000000000000000000,
  //  pools
  pools: {
    presale: {
      allocationAmount: 100 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    generalSale: {
      allocationAmount: 550 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet1: {
      allocationAmount: 20 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    wallet2: {
      allocationAmount: 20 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    wallet3: {
      allocationAmount: 20 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    wallet4: {
      allocationAmount: 10 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    wallet5: {
      allocationAmount: 5 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    wallet6: {
      allocationAmount: 5 * 1000 * 1000,
      vestingTime: new Date(2018, 6, 6)
    },
    founders: {
      allocationAmount: 30 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet7: {
      allocationAmount: 6 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet8genesis: {
      allocationAmount: 5 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet9: {
      allocationAmount: 5 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet10: {
      allocationAmount: 4 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet11bounty: {
      allocationAmount: 19 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet12: {
      allocationAmount: 4 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet13rsv: {
      allocationAmount: 100 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet14partners: {
      allocationAmount: 96 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    },
    wallet15lottery: {
      allocationAmount: 1 * 1000 * 1000,
      vestingTime: new Date(2000, 1, 1) // past
    }
  }
};
//  ------------------------------------------------------------------------------

contract('IvepCrowdsale', function (accounts) {
  let sut;
  let owner;
  let token;

  const sutInitialParams = () => {
    return Object.values({
      tokenAddress: token.address
    });
  };

  describe('Actual values tests', async () => {
    beforeEach(async function () {
      token = await TKLNToken.new({gas: 10000000});

      sut = await IvepCrowdsale.new(...sutInitialParams());
      owner = await sut.owner();
    });

    describe('Initial parameters and ownership', async function () {
      it('1. Contract default parameters.', async function () {
        const totalCollected = await sut.totalCollected();

        assert.equal(totalCollected, 0, 'Total collected amount should be zero on opening');
      });

      it('1.1 Should have an owner', async function () {
        assert.isTrue(owner === accounts[0]);
      });

      it('1.2 Should be able to transfer ownership', async function () {
        await sut.changeOwner(accounts[1]);
        let newOwner = await sut.owner();
        assert.isTrue(owner !== newOwner);
      });
    });

    describe('After initialization', async function () {
      it('1.3 ICO status should be closed for period dates in future', async function () {
        const status = await sut.isICOActive();
        console.log('ICO Status = ' + status);

        status.should.be.equal(false);
        // assert.isFalse(await sut.isICOActive());
      });

      it('2. Should be able to set initial parameters accordingly to crowdsale conditions', async function () {
        const tokenDecimals = await token.decimals();

        assert.equal(crowdsaleParams.pools.presale.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[1])).toNumber(), 'Presale pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.generalSale.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[2])).toNumber(), 'General Sale pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet1.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[3])).toNumber(), 'Wallet1 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet2.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[4])).toNumber(), 'Wallet2 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet3.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[5])).toNumber(), 'Wallet3 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet4.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[6])).toNumber(), 'Wallet4 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet5.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[7])).toNumber(), 'Wallet5 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet6.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[8])).toNumber(), 'Wallet6 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.founders.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[9])).toNumber(), 'Founders pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet7.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[10])).toNumber(), 'Wallet7 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet8genesis.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[11])).toNumber(), 'Wallet8 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet9.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[12])).toNumber(), 'Wallet9 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet10.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[13])).toNumber(), 'Wallet10 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet11bounty.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[14])).toNumber(), 'Wallet11 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet12.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[15])).toNumber(), 'Wallet12 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet13rsv.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[16])).toNumber(), 'Wallet13 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet14partners.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[17])).toNumber(), 'Wallet14 pool tokens should be allocated accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.pools.wallet15lottery.allocationAmount * 10 ** tokenDecimals, (await token.balanceOf(accounts[18])).toNumber(), 'Wallet15 pool tokens should be allocated accordingly to crowdsale conditions');

        // Check ICO goal
        assert.equal((crowdsaleParams.pools.presale.allocationAmount + crowdsaleParams.pools.generalSale.allocationAmount),
            (await sut.ICOGoal()).toNumber(),
            'ICO Goal should match crowdsale conditions');
      });

      it('3. Setting stage periods', async () => {
        assert.equal(crowdsaleParams.presaleStartDate, (await sut.ICOStagePeriod(0)).toNumber(), 'Presale start date should be set accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.presaleEndDate, (await sut.ICOStagePeriod(1)).toNumber(), 'Presale end date should be set accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.generalSaleStartDate, (await sut.ICOStagePeriod(2)).toNumber(), 'General sale start date should be set accordingly to crowdsale conditions');
        assert.equal(crowdsaleParams.generalSaleEndDate, (await sut.ICOStagePeriod(3)).toNumber(), 'General sale end date should be set accordingly to crowdsale conditions');
      });
    });
  });

  describe('Actual values tests', async () => {
    beforeEach(async function () {
      token = await TKLNToken.new({gas: 10000000});

      sut = await IvepCrowdsale.new(...sutInitialParams());

      await token.approveForCrowdsale(sut.address);
    });

    describe('Operations with eth', async () => {
      it('4. Receiving Ether outside of stage periods', async () => {
        // * Following actions performed by contract owner.
        // * Contract deployed and general parameters initialization called. Mint function called.

        // sending eth from account one to contract address
        const amount = 500;

        // conditions:
        // * Current block number (or date if periods set by exact dates) doesn't fall in any of periods.
        // * Receiving a payment with positive amount of Ether attached.
        try {
          await sut.send(amount);
        } catch (error) {
          // expected - * Transaction failed.
          const invalidOptcode = error.message.search('invalid opcode') >= 0;
          const revert = error.message.search('VM Exception while processing transaction: revert') >= 0;
          assert(invalidOptcode || revert, 'Expected throw, got <' + error + '> instead');

          return;
        }
        assert.fail('Expected throw not received');
      });
    });
  });

  describe('While stage is active', async () => {
    beforeEach(async function () {
      token = await TKLNToken.new({gas: 10000000});

      sut = await IvepCrowdsaleStub.new(...sutInitialParams()).should.be.fulfilled;
      owner = await sut.owner().should.be.fulfilled;

      await sut.activatePresaleStage().should.be.fulfilled;

      await token.approveForCrowdsale(sut.address);
    });

    let bonusCalculationAssertion = async (tokensPerEth, stageGoal) => {
      var expectedBonus =
        [
          // JavaScript thinks 1499999999999999999 is 1500000000000000000
          // so, 0.001 and 0.000001 ETH is used to test boundaries instead
          // of 1 Wei
          {amount: web3.toWei(0.25, 'ether'), bonus: 0.00},
          {amount: web3.toWei(0.49, 'ether'), bonus: 0.00},
          {amount: web3.toWei(0.5, 'ether'), bonus: 0.00},
          {amount: web3.toWei(1.0, 'ether'), bonus: 0.00},

          // 3 ETH tier is tested precisely
          {amount: web3.toWei(2.999, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.9999, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.99999, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.999995, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.999996, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.999997, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.999998, 'ether'), bonus: 0.000},
          {amount: web3.toWei(2.999999, 'ether'), bonus: 0.000},
          {amount: web3.toWei(3.000, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000001, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000002, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000003, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000004, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000005, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.000001, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.00001, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.0001, 'ether'), bonus: 0.01},
          {amount: web3.toWei(3.001, 'ether'), bonus: 0.01},

          // Test middle of tier
          {amount: web3.toWei(4.0, 'ether'), bonus: 0.01},
          {amount: web3.toWei(10.0, 'ether'), bonus: 0.02},
          {amount: web3.toWei(25.0, 'ether'), bonus: 0.03},
          {amount: web3.toWei(50.0, 'ether'), bonus: 0.04},
          {amount: web3.toWei(110.0, 'ether'), bonus: 0.05},
          {amount: web3.toWei(200.0, 'ether'), bonus: 0.06},
          {amount: web3.toWei(400.0, 'ether'), bonus: 0.07},
          {amount: web3.toWei(600.0, 'ether'), bonus: 0.08},
          {amount: web3.toWei(800.0, 'ether'), bonus: 0.09},
          {amount: web3.toWei(1200.0, 'ether'), bonus: 0.1},

          // Test tier boundaries
          {amount: web3.toWei(6.999, 'ether'), bonus: 0.01},
          {amount: web3.toWei(7.000, 'ether'), bonus: 0.02},
          {amount: web3.toWei(7.001, 'ether'), bonus: 0.02},
          {amount: web3.toWei(14.999, 'ether'), bonus: 0.02},
          {amount: web3.toWei(15.000, 'ether'), bonus: 0.03},
          {amount: web3.toWei(15.001, 'ether'), bonus: 0.03},
          {amount: web3.toWei(29.999, 'ether'), bonus: 0.03},
          {amount: web3.toWei(30.000, 'ether'), bonus: 0.04},
          {amount: web3.toWei(30.001, 'ether'), bonus: 0.04},
          {amount: web3.toWei(74.999, 'ether'), bonus: 0.04},
          {amount: web3.toWei(75.000, 'ether'), bonus: 0.05},
          {amount: web3.toWei(75.001, 'ether'), bonus: 0.05},
          {amount: web3.toWei(149.999, 'ether'), bonus: 0.05},
          {amount: web3.toWei(150.000, 'ether'), bonus: 0.06},
          {amount: web3.toWei(150.001, 'ether'), bonus: 0.06},
          {amount: web3.toWei(249.999, 'ether'), bonus: 0.06},
          {amount: web3.toWei(250.000, 'ether'), bonus: 0.07},
          {amount: web3.toWei(250.001, 'ether'), bonus: 0.07},
          {amount: web3.toWei(499.999, 'ether'), bonus: 0.07},
          {amount: web3.toWei(500.000, 'ether'), bonus: 0.08},
          {amount: web3.toWei(500.001, 'ether'), bonus: 0.08},
          {amount: web3.toWei(749.999, 'ether'), bonus: 0.08},
          {amount: web3.toWei(750.000, 'ether'), bonus: 0.09},
          {amount: web3.toWei(750.001, 'ether'), bonus: 0.09},
          {amount: web3.toWei(999.999, 'ether'), bonus: 0.09},
          {amount: web3.toWei(1000.000, 'ether'), bonus: 0.1},
          {amount: web3.toWei(1000.001, 'ether'), bonus: 0.1},

          // Test huge amount
          {amount: web3.toWei(20000.0, 'ether'), bonus: 0.1}
        ];
      // Token all values are expressed in "micro-tokens", i.e. an integer number equal to Token * 10^decimals
      // For this reason and to handle wei values, we require high precision
      BigNumber.config({ DECIMAL_PLACES: 20, ROUNDING_MODE: BigNumber.ROUND_DOWN });

      // Some helpful constants
      const address = accounts[0];
      var contractAddress = sut.address;
      const oneBN = new BigNumber(1.0);
      const tokensPerEthBN = new BigNumber(tokensPerEth);
      const stageGoalBN = (new BigNumber(stageGoal)).mul(10 ** 18);
      const tokenMultiplierBN = (new BigNumber(10)).toPower(new BigNumber(await token.decimals()));

      // Cumulative values
      var totalTokenSale = new BigNumber(0);
      var totalWeiAccepted = new BigNumber(0);

      // Loop over all test pairs amount-bonus
      for (var i = 0; i < expectedBonus.length; i++) {
        // Retirieve iteration parameters: Amount and Bonus (as BigNumber)
        const eb = expectedBonus[i];
        const bonusBN = new BigNumber(eb.bonus);
        const weiAmountBN = new BigNumber(eb.amount);
        const bonusedWeiAmountBN = (new BigNumber(eb.bonus)).add(oneBN).mul(weiAmountBN);
        const bonusedEthAmountBN = bonusedWeiAmountBN.div(10 ** 18);
        console.log('Testing amount = ' + eb.amount / 10 ** 18 + ' ETH');

        // Perform all contract operations here
        const previousTokenAmount = new BigNumber(await token.balanceOf(address));
        await sut.sendTransaction({from: address, to: contractAddress, value: eb.amount});
        const newTokenAmount = new BigNumber(await token.balanceOf(address));
        const receivedTokenAmount = newTokenAmount.sub(previousTokenAmount);
        const contractBalance = new BigNumber(await web3.eth.getBalance(contractAddress));

        // Calculate expected token amount as if we did not exceed stage goal
        var expectedTokenAmount = ((bonusedEthAmountBN.mul(tokensPerEthBN)).round()).mul(tokenMultiplierBN);

        // If we reached stage goal, we need to
        //    1. Change expectedTokenAmount appropriately
        //    2. Reset testing so that we can normally test all amounts
        var reset = false;
        if ((totalTokenSale.add(expectedTokenAmount)).greaterThan(stageGoalBN)) {
          expectedTokenAmount = stageGoalBN.sub(totalTokenSale);
          reset = true;
        }

        // Update totals
        totalTokenSale = totalTokenSale.add(expectedTokenAmount);
        const weiAccepted = (expectedTokenAmount.div(tokensPerEthBN.mul(oneBN.add(bonusBN)))).round();
        totalWeiAccepted = totalWeiAccepted.add(weiAccepted);

        // Perform validations
        contractBalance.should.be.bignumber.equal(totalWeiAccepted, 'Balance does not match for ETH amount: ' + eb.amount / crowdsaleParams.weiInEth + ', totalEth = ' + totalWeiAccepted.toString() + ', contractBalance = ' + contractBalance.toString());
        receivedTokenAmount.should.be.bignumber.equal(expectedTokenAmount, 'Bonus does not match for ETH amount: ' + eb.amount / crowdsaleParams.weiInEth + ', new amount is ' + newTokenAmount + ', old amount is ' + previousTokenAmount);

        // Reset token and crowdsale if stage goal was reached
        if (reset) {
          token = await TKLNToken.new({gas: 10000000});
          sut = await IvepCrowdsaleStub.new(...sutInitialParams()).should.be.fulfilled;
          owner = await sut.owner().should.be.fulfilled;
          await sut.activatePresaleStage().should.be.fulfilled;
          await token.approveForCrowdsale(sut.address);
          totalTokenSale = new BigNumber(0);
          totalWeiAccepted = new BigNumber(0);
          contractAddress = sut.address;
        }
      }
    };

    it('ICO should be open', async () => {
      const status = await sut.isICOActive();
      status.should.be.equal(true);
    });

    it('6. Bonus calculation for pre-sale.', async () => {
      // * Contract deployed and general parameters initialization called. Mint function called.
      // * Call executed by buyer.
      // * Pre-sale is active at the time of transaction mining.

      // * Supplied amount of Ether is sufficient to buy at least 1 token.
      // * Pre-sale wallet contains enough tokens to pay back.

      // expected -
      // * ETH amount less than 0.5 does not receive bonus
      // * ETH amount equal to 0.5, but less than 1.5 receives 0.5% bonus
      // * ... repeat for all lines in table 4.

      // send eth from account[0] to contract address
      // Use several border values to check for rounding errors

      await bonusCalculationAssertion(crowdsaleParams.tokensPerEthPresale, crowdsaleParams.pools.presale.allocationAmount);
    });

    it('7. Bonus calculation for general sale.', async () => {
      // * Contract deployed and general parameters initialization called. Mint function called.
      // * Call executed by buyer.
      // * General sale is active at the time of transaction mining.

      // * Supplied amount of Ether is sufficient to buy at least 1 token.
      // * Pre-sale wallet contains enough tokens to pay back.

      // expected -
      // * ETH amount less than 0.5 does not receive bonus
      // * ETH amount equal to 0.5, but less than 1.5 receives 0.5% bonus
      // * ... repeat for all lines in table 4.
      await sut.activateGeneralSaleStage().should.be.fulfilled;
      await bonusCalculationAssertion(crowdsaleParams.tokensPerEthGeneral, crowdsaleParams.pools.generalSale.allocationAmount);
    });

    it('12. Destroy crowdsale contract.', async function () {
      const amount = web3.toWei(1, 'ether');
      const gasPrice = 0; // Some comminism from eraly adopters. jkg, just want to simplify test logic and avoid calculating of transaction cost.

      await sut.send(amount).should.be.fulfilled;

      // Effectively cause the ICO to close
      await sut.deactivateICO();

      const accountBalanceBeforeDestruction = await web3.eth.getBalance(accounts[0]);
      await sut.kill({gasLimit: 9000000000000000000000000000, gasPrice: gasPrice});
      const actual = await web3.eth.getBalance(accounts[0]);
      const expected = accountBalanceBeforeDestruction.plus(amount).minus(getLatestBlockCost(gasPrice));

      assert.equal(actual.toString(10), expected.toString(10), 'Contract funds should be transferred to the owner before destruction');
    });
  });
});
