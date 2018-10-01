import BigNumber from 'bignumber.js';
import BN from 'bn.js';

export function partialAmountBN(
  num: BN,
  den: BN,
  target: BN,
): BN {
  const numBN = new BN(num);
  const denBN = new BN(den);
  const targetBN = new BN(target);
  return numBN.mul(targetBN).div(denBN);
}

export function divRoundedUpBN(
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

export function partialAmountRoundedUpBN(
  num: BN,
  den: BN,
  target: BN,
): BN {
  const numBN = new BN(num);
  const denBN = new BN(den);
  const targetBN = new BN(target);
  return divRoundedUpBN(numBN.mul(targetBN), denBN);
}

export function bigNumberToBN(
  input: BigNumber,
): BN {
  return new BN(input.floor().toFixed());
}
