import BigNumber from 'bignumber.js';
import BN from 'bn.js';

export default class MathHelpersBN {
  public partialAmountBN(
    num: BN,
    den: BN,
    target: BN,
    roundsUp: boolean = false,
  ): BN {
    const numBN = new BN(num);
    const denBN = new BN(den);
    const targetBN = new BN(target);

    if (roundsUp) {
      return this.divRoundedUpBN(num.mul(target), den);
    }
    return numBN.mul(targetBN).div(denBN);
  }

  public divRoundedUpBN(
    num: BN,
    den: BN,
  ): BN {
    const numBN = new BN(num);
    const denBN = new BN(den);
    if (numBN.isZero()) {
      return new BN(0);
    }
    return numBN.subn(1).div(denBN).addn(1);
  }

  public bigNumberToBN(
    input: BigNumber,
  ): BN {
    return new BN(input.floor().toFixed());
  }
}
