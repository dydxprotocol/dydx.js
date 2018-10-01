import BN from 'bn.js';
import assert from 'assert';
import {
  fractionAdd,
  fractionSub1Over,
  fractionDiv,
  fractionMul,
  fractionCopy,
  fractionBound,
} from '../src/lib/Fraction';

const bn = new BN('340282366920938463463374607431768211455');

function throwify(otherFunction) {
  function throwFunction(...allArgs) {
    let threw = false;
    try {
      otherFunction.apply(null, arguments)
    } catch (e) {
      threw = true;
    }
    assert(threw);
  }
  return throwFunction;
}

function expectBN(bn1, bn2) {
  expect(bn1.toString()).toEqual(bn2.toString());
}

describe('Fraction', () => {

  // ============ copy ============

  describe('#copy', () => {
    function copy(num, den) {
      const result = fractionCopy({
        num: new BN(num),
        den: new BN(den)
      });
      expectBN(result.num, num);
      expectBN(result.den, den);
    }

    const copyThrow = throwify(copy);

    it('succeeds for most values', async () => {
      copy(0, 1);
      copy(0, 2);
      copy(1, 1);
      copy(2, 1);
      copy(1, 2);
      copy(0, bn);
      copy(bn, bn);
    });

    it('fails for zero denominator', async () => {
      copyThrow(0, 0);
      copyThrow(1, 0);
      copyThrow(2, 0);
    });
  });

  // ============ bound ============

  describe('#bound', () => {
    function bound(num, den, numRes, denRes) {
      const result = fractionBound(new BN(num), new BN(den));
      expectBN(result.num, numRes);
      expectBN(result.den, denRes);
    }

    const boundThrow = throwify(bound);

    it('succeeds for most values', async () => {
      bound(0, 1, 0, 1);
      bound(1, 1, 1, 1);
      bound(2, 4, 2, 4);
      bound(bn, 1, bn, 1);
      bound(0, bn, 0, bn);
      bound(bn, bn, bn, bn);
      bound(bn.muln(2), bn, bn, bn.divn(2));
    });

    it('fails for zero denominator', async () => {
      boundThrow(0, 0);
      boundThrow(1, 0);
      boundThrow(bn, 0);
      boundThrow(bn.muln(2), 1);
      boundThrow(bn.muln(10), 2);
    });
  });
  // ============ add ============

  describe('#add', () => {
    it('succeeds for addition overflow', async () => {
      const one = {num: bn, den: bn};
      const result = fractionAdd(one, one);
      expectBN(result.num, result.den.muln(2));
    });
  });
  // ============ sub1Over ============

  describe('#sub1Over', () => {
    function sub1Over(num, den, d, numRes, denRes) {
      const result = fractionSub1Over(
        {
          num: new BN(num),
          den: new BN(den)
        },
        new BN(d)
      );
      expectBN(result.num, numRes);
      expectBN(result.den, denRes);
    }

    const sub1OverThrow = throwify(sub1Over);

    it('succeeds for sub1over', async () => {
      sub1Over(3, 5, 2, 1, 10);
      sub1Over(2, 6, 3, 0, 6);
      sub1Over(1, 2, 4, 2, 8);
      sub1Over(1, 2, 3, 1, 6);
      sub1Over(1, 3, 5, 2, 15);
      sub1Over(bn, bn, 2, bn.divn(2), bn);
    });

    it('fails for bad values', async () => {
      sub1OverThrow(1, 4, 2);
    });
  });

  // ============ div ============

  describe('#div', () => {
    function div(num, den, d, numRes, denRes) {
      const result = fractionDiv(
        {
          num: new BN(num),
          den: new BN(den)
        },
        new BN(d)
      );
      expectBN(result.num, numRes);
      expectBN(result.den, denRes);
    }

    const divThrow = throwify(div);

    it('succeeds for most values', async () => {
      div(0, 2, 2, 0, 2);
      div(0, 1, 2, 0, 1);
      div(2, 2, 1, 2, 2);
      div(2, 4, 3, 2, 12);
      div(bn, bn, 2, bn.divn(2), bn);
    });

    it('fails for zero denominator', async () => {
      divThrow(0, 0, 0);
      divThrow(1, 1, 0);
      divThrow(2, 2, 0);
      divThrow(1, 0, 1);
    });
  });

  // ============ mul ============

  describe('#mul', () => {
    function mul(num1, den1, num2, den2, numRes, denRes) {
      const result = fractionMul(
        {
          num: new BN(num1),
          den: new BN(den1)
        },
        {
          num: new BN(num2),
          den: new BN(den2)
        }
      );
      expectBN(result.num, numRes);
      expectBN(result.den, denRes);
    }

    const mulThrow = throwify(mul);

    it('succeeds for most values', async () => {
      mul(1, 1, 1, 1, 1, 1);
      mul(1, 4, 3, 2, 3, 8);
      mul(2, 2, 2, 2, 4, 4);
      mul(bn, bn, bn, bn, bn, bn);
      mul(3, bn, bn, 3, bn, bn);
      mul(8, bn, bn, 8, bn, bn);
    });

    it('fails for zero denominator', async () => {
      mulThrow(2, 0, 2, 2);
      mulThrow(2, 2, 2, 0);
      mulThrow(bn, 1, bn, 1);
    });
  });
});
