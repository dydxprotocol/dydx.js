import BigNumber from 'bignumber.js';

export default class MathHelpers {
  public getPartialAmount(
    numerator: BigNumber,
    denominator: BigNumber,
    target: BigNumber,
    roundsUp: boolean = false,
  ) {
    if (roundsUp) {
      return numerator.times(target).plus(denominator).minus(1).div(denominator).floor();
    }

    return numerator.times(target).div(denominator).floor();
  }
}
