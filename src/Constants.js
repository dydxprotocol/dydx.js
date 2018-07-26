const bignumberJs = require('bignumber.js');

module.exports = {
  BIG_NUMBERS: {
    ZERO: new bignumberJs(0),
    ONE_DAY_IN_SECONDS: new bignumberJs(60 * 60 * 24),
    ONE_YEAR_IN_SECONDS: new bignumberJs(60 * 60 * 24 * 365),
    ONES_127: new bignumberJs("340282366920938463463374607431768211455"), // 2**128-1
    ONES_255: new bignumberJs(
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"), // 2**256-1
  }
};
