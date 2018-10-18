import BigNumber from 'bignumber.js';
import { dydx } from './DYDX';
import { issueAndSetAllowance } from './MarginHelper';
import { BIG_NUMBERS } from '../../src/lib/Constants';

export const LenderArgs = {
  principal: new BigNumber(100),
  collateral: new BigNumber(0),
  ownerAddress: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  bucketOwner: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  from: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
  interestRate: new BigNumber(0.05),
  interestPeriodSeconds: new BigNumber(10),
  callTimeSeconds: new BigNumber(100),
  maxDurationSeconds: new BigNumber(100909),
  nonce: new BigNumber(3498234234),
  bucketTime: new BigNumber(3234243243),
  minHeldTokenPerPrincipalNumerator: new BigNumber(0),
  minHeldTokenPerPrincipalDenominator: new BigNumber(1),
  trader: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  positionOpener: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  marginCallers: [
    '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ],
  heldToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  owedToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

export const isEthereumAddress = new RegExp(/^(0x){1}[0-9a-fA-F]{40}$/i);

export async function doDeposit(blAddress, lender, amount, token) {
  await issueAndSetAllowance(token, lender, amount, dydx.contracts.BucketLenderProxy.address);
  await dydx.bucketLender.deposit(blAddress, lender, amount);
}

export async function withdrawAllETHV1(blAddress: string, withdrawer: string) {
  const depositEvents = await dydx.bucketLender.getDepositEvents(
    blAddress,
    withdrawer,
  );
  const buckets: BigNumber[] = depositEvents
    .map(e => e.args.bucket.toString())
    .filter((elem, pos, arr) => arr.indexOf(elem) === pos)
    .map(b => new BigNumber(b));
  const maxWeights: BigNumber[] = buckets.map(() => BIG_NUMBERS.ONES_255);
  return dydx.bucketLender.withdrawETHV1(
    blAddress,
    withdrawer,
    buckets,
    maxWeights,
  );
}

export async function deployBucketLender(args) {
  return dydx.bucketLender.create(
    args.bucketOwner,
    args.positionOpener,
    args.nonce,
    args.heldToken,
    args.owedToken,
    args.bucketTime,
    args.interestRate,
    args.interestPeriodSeconds,
    args.maxDurationSeconds,
    args.callTimeSeconds,
    args.minHeldTokenPerPrincipalNumerator,
    args.minHeldTokenPerPrincipalDenominator,
    args.marginCallers,
    args.trustedWithdrawers,
    args.from,
  );
}

export async function deployBucketLenderWithDelay(args) {
  return dydx.bucketLender.createWithRecoveryDelay(
    args.bucketOwner,
    args.positionOpener,
    args.nonce,
    args.heldToken,
    args.owedToken,
    args.bucketTime,
    args.interestRate,
    args.interestPeriodSeconds,
    args.maxDurationSeconds,
    args.callTimeSeconds,
    args.minHeldTokenPerPrincipalNumerator,
    args.minHeldTokenPerPrincipalDenominator,
    args.marginCallers,
    args.trustedWithdrawers,
    args.recoveryDelay,
    args.from,
  );
}
