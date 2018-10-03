import BigNumber from 'bignumber.js';
import { dydx } from './helpers/DYDX';
const { wait } = require('@digix/tempo')(dydx.contracts.web3);

import { resetEVM } from './helpers/SnapshotHelper';
import { deployERC20 } from './helpers/TokenHelper';
import {
  LenderArgs,
  getBucketLenderCreatedEvent,
  isEthereumAddress,
} from './helpers/BucketLenderHelper';
import {
  callOpenWithoutCounterparty,
  issueAndSetAllowance,
  setup,
  setupDYDX,
} from './helpers/MarginHelper';
import { BIG_NUMBERS } from '../src/lib/Constants';

let accounts: string[] = null;

describe('#testBucketLender', () => {
  beforeAll(async () => {
    await setupDYDX();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  beforeEach(async () => {
    await resetEVM();
  });

  it('Successfully deploys a Bucket Lender', async () => {
    const [
      heldToken,
      owedToken,
    ] = await Promise.all([
      deployERC20(dydx, accounts),
      deployERC20(dydx, accounts),
    ]);
    const args = { ...LenderArgs, heldToken, owedToken };

    const response: any = await dydx.bucketLender.create(
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
      args.from,
    );
    const positionId = dydx.margin.getPositionId(args.positionOpener, args.nonce);

    const createdEvent = await getBucketLenderCreatedEvent(positionId);

    expect(response.address).toEqual(createdEvent.args.at);
  });

  it('Successfully deploys a bucket lender with Recovery Delay', async () => {
    const [
      heldToken,
      owedToken,
    ] = await Promise.all([
      deployERC20(dydx, accounts),
      deployERC20(dydx, accounts),
    ]);
    const args = {
      ...LenderArgs,
      heldToken,
      owedToken,
      trustedWithdrawers: [accounts[5], accounts[6]],
      recoveryDelay: BIG_NUMBERS.ONE_DAY_IN_SECONDS,
    };
    const { address }: any = await dydx.bucketLender.createWithRecoveryDelay(
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
    expect(isEthereumAddress.test(address)).toBeTruthy();
    const owner = await dydx.bucketLender.getOwner(address);
    expect(owner).toEqual(args.bucketOwner);
  });

  it('Successfully gets lender information', async () => {
    jest.setTimeout(10000);
    const [
      heldToken,
      owedToken,
    ] = await Promise.all([
      deployERC20(dydx, accounts),
      deployERC20(dydx, accounts),
    ]);
    const args = { ...LenderArgs, heldToken, owedToken };

    const response: any = await dydx.bucketLender.create(
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
      args.from,
    );

    // set constants
    const bucketLenderAddress = response.address;
    const lendAmount = new BigNumber("1e18");
    const lender = accounts[1];

    // deposit in bucket 0
    await doDeposit(bucketLenderAddress, lender, lendAmount, owedToken);
    let allLent = await dydx.bucketLender.getLenderSummary(bucketLenderAddress, lender);
    expect(allLent.withdrawable).toEqual(lendAmount);
    expect(allLent.locked).toEqual(new BigNumber(0));

    // open position
    const openTx = await setup(accounts);
    openTx.deposit = lendAmount;
    openTx.principal = lendAmount;
    openTx.trader = args.positionOpener;
    openTx.nonce = args.nonce;
    openTx.loanOwner = bucketLenderAddress;
    openTx.heldToken = args.heldToken;
    openTx.owedToken = args.owedToken;
    openTx.maxDuration = args.maxDurationSeconds;
    openTx.callTimeLimit = args.callTimeSeconds;
    openTx.interestRate = args.interestRate;
    openTx.interestPeriod = args.interestPeriodSeconds;
    await issueAndSetAllowance(
      heldToken,
      openTx.trader,
      BIG_NUMBERS.ONES_127,
      dydx.contracts.TokenProxy.address,
    );
    await callOpenWithoutCounterparty(openTx);

    // wait for another bucket
    await wait(1);

    // deposit in bucket 1
    await doDeposit(bucketLenderAddress, lender, lendAmount, owedToken);
    allLent = await dydx.bucketLender.getLenderSummary(bucketLenderAddress, lender);
    expect(allLent.withdrawable).toEqual(lendAmount.times(2));

    // validate lent amounts after interest has accrued
    await wait(openTx.interestPeriod);
    allLent = await dydx.bucketLender.getLenderSummary(bucketLenderAddress, lender);
    expect(allLent.withdrawable).toEqual(lendAmount.times(2));
    expect(allLent.locked.isZero()).toBeFalsy();
  });
});

// ============ HELPER FUNCTIONS ============

async function doDeposit(blAddress, lender, amount, token) {
  await issueAndSetAllowance(token, lender, amount, blAddress);
  await dydx.bucketLender.deposit(blAddress, lender, lender, amount);
}
