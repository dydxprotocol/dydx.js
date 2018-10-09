import Interest from '../../src/modules/helpers/Interest';
import { Fraction128 } from '../../src/types';
import BN from 'bn.js';

export default class InterestTest extends Interest {
  public getCompoundedInterestTest(
    principal: BN,
    interestRate: BN,
    secondsOfInterest: BN,
  ): BN {
    return this.getCompoundedInterest(principal, interestRate, secondsOfInterest);
  }

  public expTest(
    X: Fraction128,
    precomputePrecision: number,
    maclaurinPrecision: number,
  ): Fraction128 {
    return this.exp(X, precomputePrecision, maclaurinPrecision);
  }
}
