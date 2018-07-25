const BigNumber = require('bignumber.js');

module.exports = {
  BIGNUMBERS: {
    ZERO: new BigNumber(0),
    ONE_DAY_IN_SECONDS: new BigNumber(60 * 60 * 24),
    ONE_YEAR_IN_SECONDS: new BigNumber(60 * 60 * 24 * 365),
    ONES_127: new BigNumber("340282366920938463463374607431768211455"), // 2**128-1
    ONES_255: new BigNumber(
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"), // 2**256-1
  },
  ADDRESSES: {
    ZERO: '0x0000000000000000000000000000000000000000',
    ONE: '0x0000000000000000000000000000000000000001',
    TEST: [
      '0x06012c8cf97bead5deae237070f9587f8e7a266d', // CryptoKittiesCore
      '0x06012c8cf97bead5deae237070f9587f8e7a2661', // 1
      '0x06012c8cf97bead5deae237070f9587f8e7a2662', // 2
      '0x06012c8cf97bead5deae237070f9587f8e7a2663', // 3
      '0x06012c8cf97bead5deae237070f9587f8e7a2664', // 4
      '0x06012c8cf97bead5deae237070f9587f8e7a2665', // 5
      '0x06012c8cf97bead5deae237070f9587f8e7a2666', // 6
      '0x06012c8cf97bead5deae237070f9587f8e7a2667', // 7
      '0x06012c8cf97bead5deae237070f9587f8e7a2668', // 8
      '0x06012c8cf97bead5deae237070f9587f8e7a2669', // 9
    ]
  }
};
