import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import InterestTest from '../helpers/InterestTest';

function expectBN(bn1, bn2) {
  expect(new BN(bn1).toString()).toEqual(new BN(bn2).toString());
}

const ONE_DAY_IN_SECONDS = new BN('86400');
const ONE_YEAR_IN_SECONDS = new BN('31536000');

const interest = new InterestTest();

describe('Interest', () => {
  describe('#exp', () => {
    it('Successfully tests exp', async () => {
      const DEFAULT_PRECOMPUTE_PRECISION = 11;
      const DEFAULT_MACLAURIN_PRECISION = 5;
      const X = {
        num: new BN(47),
        den: new BN(100),
      };

      const result = interest.expTest(
        X,
        DEFAULT_PRECOMPUTE_PRECISION,
        DEFAULT_MACLAURIN_PRECISION,
      );

      // expect the agreement with javascripts exp function to be within 0.00001%
      const delta = result.num.sub(result.den.muln(Math.exp(0.47)));
      expect(delta.abs().lte(result.num.divn(10000000))).toBeTruthy();
    });
  });

  describe('#getCompoundedInterest', () => {
    it('calculates 100% continuously compounded interest correctly', async () => {
      let result = interest.getCompoundedInterestTest(
        new BN('1000000000000000000'), // total
        new BN('100000000'), // annual percent
        ONE_YEAR_IN_SECONDS, // time
      );
      expectBN(result, '2718281828459045236'); // 1e18 * E^(100%)

      result = interest.getCompoundedInterestTest(
        new BN('1000000000000000000'), // total (1e18)
        new BN('10000000'), // annual percent (10e6)
        ONE_YEAR_IN_SECONDS.muln(10), // time
      );
      expectBN(result, '2718281828459045236'); // 1e18 * E^(100%)
    });

    it('calculates just below 100% correctly', async () => {
      const result = interest.getCompoundedInterestTest(
        new BN('1000000000000000000'), // total (1e18)
        new BN('99999999'), // annual percent
        ONE_YEAR_IN_SECONDS, // time
      );
      expectBN(result, '2718281801276227087'); // Calculated using WolframAlpha
    });

    it('calculates < 100% correctly', async () => {
      const result = interest.getCompoundedInterestTest(
        new BN('1000000000000000000'), // total (1e18)
        new BN('5000000'), // annual percent (5e6)
        ONE_DAY_IN_SECONDS.muln(3), // time
      );
      expectBN(result, '1000411043359288829'); // 1e18 * E^(5% * 3/365)
    });

    it('calculates > 100% correctly', async () => {
      const result = interest.getCompoundedInterestTest(
        new BN('1000000000000000000'), // total (1e18)
        new BN('100000000'), // annual percent (100e6)
        ONE_DAY_IN_SECONDS.muln(368), // time
      );
      expectBN(result, '2740715939567547185'); // 1e18 * E^(368/365)
    });

    it('calculates > 3200% correctly', async () => {
      const result = interest.getCompoundedInterestTest(
        new BN('1'), // total
        new BN('3300000000'), // annual percent (3300e6)
        ONE_YEAR_IN_SECONDS, // time
      );
      expectBN(result, '214643579785917'); // 1 * E^(368/365)
    });

    it('calculates primes correctly', async () => {
      const result = interest.getCompoundedInterestTest(
        new BN('100000037'), // total
        new BN('100000007'), // annual percent
        new BN('30000001'), // time
      );
      expectBN(result, '258905833'); // Calculated using WolframAlpha
    });
  });

  describe('#getPrincipalPlusInterest', () => {
    it('calculates < 100% correctly', async () => {
      const result = interest.getOwedAmount(
        new BigNumber('86400'),
        new BigNumber('344366'),
        new BigNumber('1000000000000000000'), // total (1e18)
        new BigNumber('0.05'), // 5%
        new BigNumber('3600'),
      );
      expectBN(result.toFixed(), '1000411043359288829'); // 1e18 * E^(5% * 3/365)
    });
  });
});
