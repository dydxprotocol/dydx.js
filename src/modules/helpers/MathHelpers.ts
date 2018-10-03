import BigNumber from 'bignumber.js';

export default class MathHelpers {
  public partialAmount(
    numerator: BigNumber,
    denominator: BigNumber,
    target: BigNumber,
    roundsUp: boolean = false,
  ) {
    if (roundsUp) {
      return this.divRoundedUp(numerator.times(target), denominator);
    }

    return numerator.times(target).div(denominator).floor();
  }

  public divRoundedUp(
    num: BigNumber,
    den: BigNumber,
  ): BigNumber {
    if (num.isZero()) {
      return new BigNumber(0);
    }
    return num.plus(den).minus(1).div(den).floor();
  }
}
