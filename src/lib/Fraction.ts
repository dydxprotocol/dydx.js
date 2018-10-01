import BN from 'bn.js';
import assert from 'assert';
import { Fraction128 } from '../types';
import { BNS } from './Constants';

export function fractionAdd(
  a: Fraction128,
  b: Fraction128,
): Fraction128 {
  fValidate(a);
  fValidate(b);

  let left = a.num.mul(b.den);
  let right = b.num.mul(a.den);
  let denominator = a.den.mul(b.den);

  // if left + right overflows, prevent overflow
  if (left.add(right).gt(BNS.ONES_255)) {
    left = left.divn(2);
    right = right.divn(2);
    denominator = denominator.divn(2);
  }

  return fractionBound(
    left.add(right),
    denominator,
  );
}

export function fractionSub1Over(
  a: Fraction128,
  d: BN,
): Fraction128 {
  fValidate(a);

  if (a.den.mod(d).isZero()) {
    return fractionBound(
      a.num.sub(a.den.div(d)),
      a.den,
    );
  }
  return fractionBound(
    a.num.mul(d).sub(a.den),
    a.den.mul(d),
  );
}

export function fractionDiv(
  a: Fraction128,
  d: BN,
): Fraction128 {
  fValidate(a);

  if (a.num.mod(d).isZero()) {
    return fractionBound(
      a.num.div(d),
      a.den,
    );
  }
  return fractionBound(
    a.num,
    a.den.mul(d),
  );
}

export function fractionMul(
  a: Fraction128,
  b: Fraction128,
): Fraction128 {
  fValidate(a);
  fValidate(b);

  return fractionBound(
    a.num.mul(b.num),
    a.den.mul(b.den),
  );
}

export function fractionBound(
  num: BN,
  den: BN,
): Fraction128 {
  const max = num.gt(den) ? num : den;

  let newNum = new BN(num);
  let newDen = new BN(den);

  if (max.gt(BNS.ONES_127)) {
    const divisor = max.shrn(128).addn(1);
    newNum = num.div(divisor);
    newDen = den.div(divisor);
  }

  const toReturn = {
    num: newNum,
    den: newDen,
  };

  fValidate(toReturn);

  return toReturn;
}

export function fractionCopy(
  a: Fraction128,
): Fraction128 {
  fValidate(a);

  return {
    num: new BN(a.num),
    den: new BN(a.den),
  };
}

export function fValidate(
  a: Fraction128,
): void {
  assert(a.num.gte(0));
  assert(a.den.gte(0));

  assert(a.num.lte(BNS.ONES_127));
  assert(a.den.lte(BNS.ONES_127));

  assert(!a.den.isZero());
}
