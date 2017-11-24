pragma solidity ^0.4.15;

contract CrowdsaleParameters {
    struct AddressTokenAllocation {
        address addr;
        uint256 amount;
        uint256 vestingTS;
    }
    // address for vested tokens
    address internal constant incentiveReserveAddress   = 0xDbfa2c8FaF389d858b1C3049a6Fa0F5cb8c8257A;

    // Vesting time stamps: 50% will vest after ICO ends. The rest will vest within 6 months in equal monthly installments
    // 1532131200 = July 21, 2018. 6 months from Jan 21, 2018. 00:00:00 GMT
    // 1534809600 = August 21, 2018. 1 month from July 21, 2018. 00:00:00 GMT
    // 1537488000 = September 21, 2018. 1 month from August 21, 2018. 00:00:00 GMT
    // 1540080000 = October 21, 2018. 1 month from September 21, 2018. 00:00:00 GMT
    // 1542758400 = November 21, 2018. 1 month from October 21, 2018. 00:00:00 GMT
    // 1545350400 = December 21, 2018. 1 month from November 21, 2018. 00:00:00 GMT
    // 1548028800 = Jan 21, 2019. 1 month from December 21, 2018. 00:00:00 GMT

    uint256 internal constant totalTokenAmount = 100e7; // 1 000 000 000 all tokens
    uint256 internal constant firstTokenAmount = 50e7; // 500 000 000 will vest after ICO ends
    uint256 internal constant somePreSaleTokenAmount = 50e7 / 6; // 1 of six parts after 6 months sale

    uint256 internal constant generalSaleStartDate = 1513296000; // Dec, 15, 2017 00:00:00 UTC
    uint256 internal constant generalSaleEndDate = 1515974400; // Jan, 21, 2018 00:00:00 UTC

    AddressTokenAllocation internal presaleWallet       = AddressTokenAllocation(0x8d6d63c22D114C18C2a0dA6Db0A8972Ed9C40343, 10e8, 1532131200); // 6 months vesting
    AddressTokenAllocation internal generalSaleWallet   = AddressTokenAllocation(0x9567397B445998E7E405D5Fc3d239391bf5d0200, 30e7, 0);
    AddressTokenAllocation internal wallet1presale      = AddressTokenAllocation(0x5d2fca837fdFDDCb034555D8E79CA76A54038e16, somePreSaleTokenAmount, 1534809600);
    AddressTokenAllocation internal wallet2presale      = AddressTokenAllocation(0xd3b6B8528841C1c9a63FFA38D96785C32E004fA5, somePreSaleTokenAmount, 1537488000);
    AddressTokenAllocation internal wallet3presale      = AddressTokenAllocation(0xa83202b9346d9Fa846f1B0b3BB0AaDAbEa88908E, somePreSaleTokenAmount, 1540080000);
    AddressTokenAllocation internal wallet4presale      = AddressTokenAllocation(0xd9BbEdA239CF85ED4157ae333073597c8ee206BF, somePreSaleTokenAmount, 1542758400);
    AddressTokenAllocation internal wallet5presale      = AddressTokenAllocation(0x54fF4c68d05E2598C9241ADE09ac1FD5fFB8279C, somePreSaleTokenAmount, 1545350400);
    AddressTokenAllocation internal wallet6presale      = AddressTokenAllocation(0xa7a629529599023207B3B89A7Ee792aD20e6A8fb, somePreSaleTokenAmount, 1548028800);
    AddressTokenAllocation internal foundersWallet      = AddressTokenAllocation(0x2587160168148C7c63EA8E7CA66755dbEc62c77e, 28e7, 0);
    AddressTokenAllocation internal bountyWallet        = AddressTokenAllocation(0xd97860cb4a2AAd7F41bB5907731778D68682C701, 2e7, 1532131200); // 6 months vesting
    AddressTokenAllocation internal wallet1bounty       = AddressTokenAllocation(0x5d2fca837fdFDDCb034555D8E79CA76A54038e16, somePreSaleTokenAmount, 1534809600);
    AddressTokenAllocation internal wallet2bounty       = AddressTokenAllocation(0xd3b6B8528841C1c9a63FFA38D96785C32E004fA5, somePreSaleTokenAmount, 1537488000);
    AddressTokenAllocation internal wallet3bounty       = AddressTokenAllocation(0xa83202b9346d9Fa846f1B0b3BB0AaDAbEa88908E, somePreSaleTokenAmount, 1540080000);
    AddressTokenAllocation internal wallet4bounty       = AddressTokenAllocation(0xd9BbEdA239CF85ED4157ae333073597c8ee206BF, somePreSaleTokenAmount, 1542758400);
    AddressTokenAllocation internal wallet5bounty       = AddressTokenAllocation(0x54fF4c68d05E2598C9241ADE09ac1FD5fFB8279C, somePreSaleTokenAmount, 1545350400);
    AddressTokenAllocation internal wallet6bounty       = AddressTokenAllocation(0xa7a629529599023207B3B89A7Ee792aD20e6A8fb, somePreSaleTokenAmount, 1548028800);
    AddressTokenAllocation internal wallet12Reserve     = AddressTokenAllocation(0x0f0E2f4843620b10d369cf8a165817eeB9b87e86, 40e7, 0);
}
