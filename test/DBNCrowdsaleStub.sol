pragma solidity ^0.4.15;
import '../contracts/DBNCrowdsale.sol';

contract DBNCrowdsaleStub is DBNCrowdsale {
    function DBNCrowdsaleStub(address _tokenAddress) public
        DBNCrowdsale(_tokenAddress) {
    }

    /**
    *  Activate presale and set general sale to some dates in the future
    */
    function activatePresaleStage() public {
        ICOStagePeriod[0] = now;
        ICOStagePeriod[1] = now + 1 weeks;
        ICOStagePeriod[2] = 2512950400;
        ICOStagePeriod[3] = 2513555200;
    }

    /**
    *  Activate general sale and set presale dates to some dates in the past
    */
    function activateGeneralSaleStage() public {
        ICOStagePeriod[0] = 1312950400;
        ICOStagePeriod[1] = 1313555200;
        ICOStagePeriod[2] = now;
        ICOStagePeriod[3] = now + 1 weeks;
    }

    /**
    *  Deactivate general sale and presale
    */
    function deactivateICO() public {
        ICOStagePeriod[0] = 1000000000;
        ICOStagePeriod[1] = 1000000001;
        ICOStagePeriod[2] = 1000000002;
        ICOStagePeriod[3] = 1000000003;
    }
}
