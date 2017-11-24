require('chai')
  .should();

contract('IVEPToken', function (accounts) {
  var IVEPToken = artifacts.require('./IVEPTokenStub.sol');
  let sut;
  var userAddress;

  beforeEach(async function () {
    // Provide 10M gas for token deployment. As of Nov-16-17, this is 0.001 ETH == $0.30
    sut = await IVEPToken.new({gas: 10000000});
    userAddress = accounts[19];
    console.log('address = ', sut.contract.address);
  });

  it('0. Should put 0 in the first account', async () => {
    const address = accounts[0];
    const initialBalance = await sut.balanceOf(address);
    assert.equal(0, initialBalance.valueOf(), 'The owner balance was non-zero');
  });

  it('1. Allocated tokens do not vest before vesting period', async () => {
    // Contract deployed and general parameters initialization called. Mint function called.
    // Allocation owner requests transfer from allocation wallet to their address
    const sender = accounts[0];
    const recipient = userAddress;
    const mint = {
      account: sender,
      allocationAmount: 10,
      vestingTime: new Date(2018, 10, 1).getTime()
    };
    const transfer = {
      to: recipient,
      value: 10
    };
    const recipientBalanceBefore = (await sut.balanceOf(recipient)).toNumber();
    await sut.mint(...Object.values(mint));
    const senderBalanceAfterMint = (await sut.balanceOf(sender)).toNumber();

    try {
      await sut.transfer(...Object.values(transfer), {from: sender});
      const senderBalanceAfter = (await sut.balanceOf(sender)).toNumber();
      const recipientBalanceAfter = (await sut.balanceOf(recipient)).toNumber();
      assert.equal(senderBalanceAfterMint, senderBalanceAfter + mint.allocationAmount, 'Transfer from sender failed');
      assert.equal(recipientBalanceBefore, recipientBalanceAfter - mint.allocationAmount, 'Transfer to recepient failed');
    } catch (error) {
      const invalidOptcode = error.message.search('invalid opcode') >= 0;
      const revert = error.message.search('VM Exception while processing transaction: revert') >= 0;
      assert(invalidOptcode || revert, 'Expected throw, got <' + error + '> instead');
      return;
    }
    assert.isFalse(false, 'Expected throw not received');
  });

  it('1-1. Allocated tokens do not vest before vesting period. Negative mint scenario.', async () => {
    const sender = accounts[0];
    const mint = {
      account: sender,
      allocationAmount: 10,
      vestingTime: 'text' // new Date(2018, 11, 1).getTime()
    };
    try {
      await sut.mint(...Object.values(mint));
    } catch (error) {
      const invalidOptcode = error.message.search('not a number') >= 0;
      const revert = error.message.search('VM Exception while processing transaction: revert') >= 0;
      assert(invalidOptcode || revert, 'Expected throw, got <' + error + '> instead');
      return;
    }
    assert.isFalse(false, 'Expected throw not received');
  });

  it('1-2. Allocated tokens do not vest before vesting period. Negative transfer scenario.', async () => {
    const sender = accounts[0];
    const recipient = userAddress;
    const transfer = {
      to: recipient,
      value: 10
    };
    try {
      await sut.transfer(...Object.values(transfer), {from: sender});
    } catch (error) {
      const invalidOptcode = error.message.search('invalid opcode') >= 0;
      const revert = error.message.search('VM Exception while processing transaction: revert') >= 0;
      assert(invalidOptcode || revert, 'Expected throw, got <' + error + '> instead');
      return;
    }
    assert.isFalse(false, 'Expected throw not received');
  });

  it('2. Allocated tokens vest after vesting period', async () => {
    // Verify that
    //   1. Vested balance changes after vesting
    //   2. Vested balance can be transferred after vesting
    const sender = accounts[0];
    const recipient = userAddress;
    // Contract deployed and general parameters initialization called. Mint function called.
    const totalSenderBalanceBefore = (await sut.balanceOf(sender)).toNumber();
    const vestedSenderBalanceBefore = (await sut.vestedBalanceOf(sender)).toNumber();
    const totalRecipientBalanceBefore = (await sut.balanceOf(recipient)).toNumber();
    const vestedRecipientBalanceBefore = (await sut.vestedBalanceOf(sender)).toNumber();
    const mint = {
      account: sender,
      allocationAmount: 10,
      vestingTime: 30 // new Date(2018, 11, 1).getTime()
    };
    const transfer = {
      to: recipient,
      value: 10
    };
    await sut.mint(...Object.values(mint));
    const totalSenderBalanceAfterVesting = (await sut.balanceOf(sender)).toNumber();
    const vestedSenderBalanceAfterVesting = (await sut.vestedBalanceOf(sender)).toNumber();
    // Allocation owner requests transfer from allocation wallet to their address
    await sut.transfer(...Object.values(transfer), {from: sender});
    const totalSenderBalanceAfterTransfer = (await sut.balanceOf(sender)).toNumber();
    const totalRecipientBalanceAfterTransfer = (await sut.balanceOf(recipient)).toNumber();
    assert.equal(0, totalSenderBalanceBefore, 'Total sender balance was non-zero before mint');
    assert.equal(0, vestedSenderBalanceBefore, 'Vested sender balance was non-zero before mint');
    assert.equal(0, totalRecipientBalanceBefore, 'Total recipient balance was non-zero before mint');
    assert.equal(0, vestedRecipientBalanceBefore, 'Vested recipient balance was non-zero before mint');
    assert.equal(mint.allocationAmount * 1e18, totalSenderBalanceAfterVesting, 'Mint function was not called');
    assert.equal(vestedSenderBalanceAfterVesting - transfer.value, totalSenderBalanceAfterTransfer, 'Transfer from first account failed');
    assert.equal(totalRecipientBalanceBefore + transfer.value, totalRecipientBalanceAfterTransfer, 'Transfer to second account failed');
  });

  it('3. Tokens can be destroyed', async function () {
    const address = accounts[1];
    const decimals = (await sut.decimals()).toNumber();
    const destroy = {
      from: address,
      amount: 50 * 1000 * 1000 * (10 ** decimals)
    };
    const balanceBefore = (await sut.balanceOf(address)).toNumber();
    await sut.destroy(...Object.values(destroy));
    const balanceAfter = (await sut.balanceOf(address)).toNumber();
    balanceBefore.should.not.be.equal(0, 'Initial account balance is zero');
    balanceAfter.should.be.equal(balanceBefore - destroy.amount, 'Destroy failed');
  });
});
