import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import assert from 'assert';
import { BNS, FRACTIONS } from '../../lib/Constants';
import {
  fractionAdd,
  fractionSub1Over,
  fractionMul,
  fractionDiv,
  fractionCopy,
} from '../../lib/Fraction';
import { Fraction128 } from '../../types';
import { partialAmountRoundedUpBN, bigNumberToBN } from './MathHelpersBN';

// ============ CONSTANTS ============

const MAX_PRECOMPUTE_PRECISION = 32; // Number of precomputed integers, X, for E^((1/2)^X)
const NUM_PRECOMPUTED_INTEGERS = 32; // Number of precomputed integers, X, for E^X
const DEFAULT_PRECOMPUTE_PRECISION = 11;
const DEFAULT_MACLAURIN_PRECISION = 5;
const MAXIMUM_EXPONENT = 80;
const E_TO_MAXIMUM_EXPONENT = new BN('55406223843935100525711733958316613');

export default class Interest {

  // ============ PUBLIC FUNCTIONS ============

  /**
   * Calculates the owed interest for a given principal and interest rate. Reproduces the
   * calculations done by the dYdX protocol on chain.
   *
   * @param  startEpoch     Position start timestamp in epoch seconds
   * @param  endEpoch       Query timestamp in epoch seconds
   * @param  principal      Principal to calculate interest on
   * @param  interestRate   Interest rate (e.g. 10% per year is 0.1)
   * @param  interestPeriod Interest period of the position
   * @return                Principal + Interest
   */
  public getOwedAmount(
    startEpoch: BigNumber,
    endEpoch: BigNumber,
    principal: BigNumber,
    interestRate: BigNumber,
    interestPeriod: BigNumber,
  ): BigNumber {
    const diffEpoch = endEpoch.minus(startEpoch);
    const numPeriods = diffEpoch.minus(1).div(interestPeriod).floor().plus(1);
    const secondsOfInterest = numPeriods.times(interestPeriod);

    const resultAsBN = this.getCompoundedInterest(
      bigNumberToBN(principal),
      bigNumberToBN(interestRate.times(100).times(1000000)),
      bigNumberToBN(secondsOfInterest),
    );

    return new BigNumber(resultAsBN.toString());
  }

  // ============ PROTECTED FUNCTIONS ============

  /**
   * Copy of the getCompoundedInterest function in the dYdX Margin Protocol.
   *
   * @param  principal         Principal to calculate interest on
   * @param  interestRate      Interest rate (5% is 5,000,000)
   * @param  secondsOfInterest Number of seconds of interest to calculate for
   * @return                   Principal + Interest
   */
  protected getCompoundedInterest(
    principal: BN,
    interestRate: BN,
    secondsOfInterest: BN,
  ): BN {
    const numerator = interestRate.mul(secondsOfInterest);
    const denominator = new BN('3153600000000000'); // (seconds in a year) * (10 ^ 8)

    // fraction representing (Rate * Time)
    const rt = {
      num: numerator,
      den: denominator,
    };

    // calculate e^(RT)
    let eToRT;
    if (numerator.div(denominator).gten(MAXIMUM_EXPONENT)) {
      // degenerate case: cap calculation
      eToRT = {
        num: E_TO_MAXIMUM_EXPONENT,
        den: new BN(1),
      };
    } else {
      // normal case: calculate e^(RT)
      eToRT = this.exp(
        rt,
        DEFAULT_PRECOMPUTE_PRECISION,
        DEFAULT_MACLAURIN_PRECISION,
      );
    }

    // e^X for positive X should be greater-than or equal to 1
    assert(eToRT.num.gte(eToRT.den));

    return partialAmountRoundedUpBN(eToRT.num, eToRT.den, principal);
  }

  protected exp(
    X: Fraction128,
    precomputePrecision: number,
    maclaurinPrecision: number,
  ): Fraction128 {
    assert(precomputePrecision <= MAX_PRECOMPUTE_PRECISION);

    if (X.num.isZero()) { // e^0 = 1
      return FRACTIONS.ONE;
    }

    // get the integer value of the fraction (example: 9/4 is 2.25 so has integerValue of 2)
    let integerX = X.num.div(X.den).toNumber();

    // if X is less than 1, then just calculate X
    if (integerX === 0) {
      return this.expHybrid(X, precomputePrecision, maclaurinPrecision);
    }

    // get e^integerX
    let expOfInt = this.getPrecomputedEToThe(integerX % NUM_PRECOMPUTED_INTEGERS);
    while (integerX >= NUM_PRECOMPUTED_INTEGERS) {
      expOfInt = fractionMul(expOfInt, this.getPrecomputedEToThe(NUM_PRECOMPUTED_INTEGERS));
      integerX -= NUM_PRECOMPUTED_INTEGERS;
    }

    // multiply e^integerX by e^decimalX
    const decimalX = {
      num: X.num.mod(X.den),
      den: X.den,
    };

    const hybridFraction = this.expHybrid(decimalX, precomputePrecision, maclaurinPrecision);
    return fractionMul(hybridFraction, expOfInt);
  }

  // ============ PRIVATE FUNCTIONS ============

  private expHybrid(
    X: Fraction128,
    precomputePrecision: number,
    maclaurinPrecision: number,
  ): Fraction128 {
    assert(precomputePrecision <= MAX_PRECOMPUTE_PRECISION);
    assert(X.num.lt(X.den));

    if (X.num.isZero()) { // e^0 = 1
      return FRACTIONS.ONE;
    }

    let Xtemp = fractionCopy(X);
    let result = FRACTIONS.ONE;

    let d = new BN(1); // 2^i
    for (let i = 1; i <= precomputePrecision; i += 1) {
      d = d.muln(2); // d *= 2

      // if Fraction > 1/d, subtract 1/d and multiply result by precomputed e^(1/d)
      if (Xtemp.num.mul(d).gte(Xtemp.den)) {
        Xtemp = fractionSub1Over(Xtemp, d);
        result = fractionMul(result, this.getPrecomputedEToTheHalfToThe(i));
      }
    }

    return fractionMul(result, this.expMaclaurin(Xtemp, maclaurinPrecision));
  }

  /**
   * Returns e^X for any X, using Maclaurin Series approximation
   *
   * e^X = SUM(X^n / n!) for n >= 0
   * e^X = 1 + X/1! + X^2/2! + X^3/3! ...
   *
   * @param  X           Exponent
   * @param  precision   Accuracy of Maclaurin terms
   * @return             e^X
   */
  private expMaclaurin(
      X: Fraction128,
      precision: number,
  ): Fraction128 {
    if (X.num.isZero()) { // e^0 = 1
      return FRACTIONS.ONE;
    }

    let result = FRACTIONS.ONE;
    let Xtemp = FRACTIONS.ONE;
    for (let i = 1; i <= precision; i += 1) {
      const divided = fractionDiv(X, new BN(i));
      Xtemp = fractionMul(Xtemp, divided);
      result = fractionAdd(result, Xtemp);
    }
    return result;
  }

  /**
   * Returns a fraction roughly equaling E^((1/2)^x) for integer x
   */
  private getPrecomputedEToTheHalfToThe(
    x: number,
  ): Fraction128 {
    assert(x <= MAX_PRECOMPUTE_PRECISION);
    const denominator = [
      '125182886983370532117250726298150828301',
      '206391688497133195273760705512282642279',
      '265012173823417992016237332255925138361',
      '300298134811882980317033350418940119802',
      '319665700530617779809390163992561606014',
      '329812979126047300897653247035862915816',
      '335006777809430963166468914297166288162',
      '337634268532609249517744113622081347950',
      '338955731696479810470146282672867036734',
      '339618401537809365075354109784799900812',
      '339950222128463181389559457827561204959',
      '340116253979683015278260491021941090650',
      '340199300311581465057079429423749235412',
      '340240831081268226777032180141478221816',
      '340261598367316729254995498374473399540',
      '340271982485676106947851156443492415142',
      '340277174663693808406010255284800906112',
      '340279770782412691177936847400746725466',
      '340281068849199706686796915841848278311',
      '340281717884450116236033378667952410919',
      '340282042402539547492367191008339680733',
      '340282204661700319870089970029119685699',
      '340282285791309720262481214385569134454',
      '340282326356121674011576912006427792656',
      '340282346638529464274601981200276914173',
      '340282356779733812753265346086924801364',
      '340282361850336100329388676752133324799',
      '340282364385637272451648746721404212564',
      '340282365653287865596328444437856608255',
      '340282366287113163939555716675618384724',
      '340282366604025813553891209601455838559',
      '340282366762482138471739420386372790954',
      '340282366841710300958333641874363209044',
    ][x]; // tslint:disable-line
    return {
      num: BNS.ONES_127,
      den: new BN(denominator),
    };
  }

  /**
   * Returns a fraction roughly equaling E^(x) for integer x
   */
  private getPrecomputedEToThe(
    x: number,
  ): Fraction128 {
    assert(x <= NUM_PRECOMPUTED_INTEGERS);
    const denominator = [
      '340282366920938463463374607431768211455',
      '125182886983370532117250726298150828301',
      '46052210507670172419625860892627118820',
      '16941661466271327126146327822211253888',
      '6232488952727653950957829210887653621',
      '2292804553036637136093891217529878878',
      '843475657686456657683449904934172134',
      '310297353591408453462393329342695980',
      '114152017036184782947077973323212575',
      '41994180235864621538772677139808695',
      '15448795557622704876497742989562086',
      '5683294276510101335127414470015662',
      '2090767122455392675095471286328463',
      '769150240628514374138961856925097',
      '282954560699298259527814398449860',
      '104093165666968799599694528310221',
      '38293735615330848145349245349513',
      '14087478058534870382224480725096',
      '5182493555688763339001418388912',
      '1906532833141383353974257736699',
      '701374233231058797338605168652',
      '258021160973090761055471434334',
      '94920680509187392077350434438',
      '34919366901332874995585576427',
      '12846117181722897538509298435',
      '4725822410035083116489797150',
      '1738532907279185132707372378',
      '639570514388029575350057932',
      '235284843422800231081973821',
      '86556456714490055457751527',
      '31842340925906738090071268',
      '11714142585413118080082437',
      '4309392228124372433711936',
    ][x]; // tslint:disable-line
    return {
      num: BNS.ONES_127,
      den: new BN(denominator),
    };
  }
}

export class InterestTest extends Interest {
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
