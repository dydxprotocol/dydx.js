import { DateTime } from 'luxon';
import BigNumber from 'bignumber.js';
import { BIG_NUMBERS } from '../../lib/Constants';
import { Decimal } from 'decimal.js';

export default class Interest {
  public getOwedAmount(
    startDateTime: DateTime,
    nowDateTime: DateTime,
    principal: BigNumber,
    interestRate: BigNumber,
    interestPeriod: BigNumber,
  ): BigNumber {
    if (interestRate.isZero()) {
      return principal;
    }

    const secondsSinceStart: BigNumber = new BigNumber(
      nowDateTime.diff(startDateTime, 'seconds').seconds,
    ).floor();

    const periodSecondsSinceStart: BigNumber = secondsSinceStart
      .div(interestPeriod)
      .floor()
      .mul(interestPeriod);

    const daysSinceStart: BigNumber = periodSecondsSinceStart
      .div(BIG_NUMBERS.ONE_DAY_IN_SECONDS);

    // BigNumber does not support exponents that are not
    // whole numbers, so we use Decimal.js here for doing
    // only that.
    const result: string = new Decimal(Math.E)
      .pow(interestRate.mul(daysSinceStart).div(365).toString())
      .toString();

    const resultBN: BigNumber = new BigNumber(result);

    return principal.mul(resultBN).ceil();
  }
}
