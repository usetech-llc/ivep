pragma solidity ^0.4.15;

contract CrowdsaleParameters {
    struct AddressTokenAllocation {
        address addr;
        uint256 amount;
        uint256 vestingTS;
    }

    // Vesting time stamps: 50% will vest after ICO ends. The rest will vest within 6 months in equal monthly installments
    // 1529020800 = June 15, 2018. 6 months from December 15, 2017. 00:00:00 GMT
    // 1531612800 = July 15, 2018. 1 month from June 15, 2018. 00:00:00 GMT
    // 1534291200 = August 15, 2018. 1 month from July 15, 2018. 00:00:00 GMT
    // 1536969600 = September 15, 2018. 1 month from August 15, 2018. 00:00:00 GMT
    // 1539561600 = October 15, 2018. 1 month from September 15, 2018. 00:00:00 GMT
    // 1542240000 = November 15, 2018. 1 month from Oktober 15, 2018. 00:00:00 GMT
    // 1544832000 = December 15, 2018. 1 month from November 15, 2018. 00:00:00 GMT

    AddressTokenAllocation internal presaleWallet       = AddressTokenAllocation(0x8d6d63c22D114C18C2a0dA6Db0A8972Ed9C40343, 100e6, 0);
    AddressTokenAllocation internal generalSaleWallet   = AddressTokenAllocation(0x9567397B445998E7E405D5Fc3d239391bf5d0200, 550e6, 0);
    AddressTokenAllocation internal wallet1             = AddressTokenAllocation(0x5d2fca837fdFDDCb034555D8E79CA76A54038e16,  20e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal wallet2             = AddressTokenAllocation(0xd3b6B8528841C1c9a63FFA38D96785C32E004fA5,  20e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal wallet3             = AddressTokenAllocation(0xa83202b9346d9Fa846f1B0b3BB0AaDAbEa88908E,  20e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal wallet4             = AddressTokenAllocation(0xd9BbEdA239CF85ED4157ae333073597c8ee206BF,  10e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal wallet5             = AddressTokenAllocation(0x54fF4c68d05E2598C9241ADE09ac1FD5fFB8279C,   5e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal wallet6             = AddressTokenAllocation(0xa7a629529599023207B3B89A7Ee792aD20e6A8fb,   5e6, 1534672800); // 180 day vesting
    AddressTokenAllocation internal foundersWallet      = AddressTokenAllocation(0x2587160168148C7c63EA8E7CA66755dbEc62c77e,  30e6, 1526896800); // 90 day vesting
    AddressTokenAllocation internal wallet7             = AddressTokenAllocation(0x64820b0f23d263FfB468EDCC749E6a30c4e49852,   6e6, 0);
    AddressTokenAllocation internal wallet8genesis      = AddressTokenAllocation(0x9c1cfe773425B63F8174d7Ec3eE6D585aA410d00,   5e6, 0);
    AddressTokenAllocation internal wallet9             = AddressTokenAllocation(0xD00094c27603BAde402d572e845354E31655F65B,   5e6, 0);
    AddressTokenAllocation internal wallet10            = AddressTokenAllocation(0x1eA0A708A84b2b45E99a6f8F0aef7434B7677ab8,   4e6, 0);
    AddressTokenAllocation internal wallet11bounty      = AddressTokenAllocation(0xd97860cb4a2AAd7F41bB5907731778D68682C701,  19e6, 0);
    AddressTokenAllocation internal wallet12            = AddressTokenAllocation(0x0f0E2f4843620b10d369cf8a165817eeB9b87e86,   4e6, 0);
    AddressTokenAllocation internal wallet13rsv         = AddressTokenAllocation(0xaA98065132F72C3f6b02093d7a7bd598403d90F2, 100e6, 0);
    AddressTokenAllocation internal wallet14partners    = AddressTokenAllocation(0xaFA7cbfBEd818F9EcD22493BA138BAf85E9c6E39,  96e6, 0);
    AddressTokenAllocation internal wallet15lottery     = AddressTokenAllocation(0x379d250Db31B619B79FC6b993b82C407f097508D,   1e6, 0);

    uint256 internal constant presaleStartDate = 1513072800; // Dec-12-2017 10:00:00 GMT
    uint256 internal constant presaleEndDate = 1515751200; // Jan-12-2018 10:00:00 GMT
    uint256 internal constant generalSaleStartDate = 1516442400; // Jan-20-2018 00:00:00 GMT
    uint256 internal constant generalSaleEndDate = 1519120800; // Feb-20-2018 00:00:00 GMT
}
