import BigNumber from 'bignumber.js';
import { dydx } from '../helpers/DYDX';
const { wait } = require('@digix/tempo')(dydx.contracts.web3);

import { resetEVM } from '../helpers/SnapshotHelper';
import { deployERC20 } from '../helpers/TokenHelper';
import {
  LenderArgs,
  deployBucketLenderWithDelay,
  deployBucketLender,
  withdrawAllETHV1,
  isEthereumAddress,
  doDeposit,
} from '../helpers/BucketLenderHelper';
import {
  callOpenWithoutCounterparty,
  issueAndSetAllowance,
  setup,
  setupDYDX,
} from '../helpers/MarginHelper';
import { BIG_NUMBERS } from '../../src/lib/Constants';

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
    const args = {
      ...LenderArgs,
      heldToken,
      owedToken,
      trustedWithdrawers: [accounts[5], accounts[6]],
    };

    const { address }: any = await dydx.bucketLender.create(
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
    const bucketOwner = await dydx.bucketLender.getOwner(address);
    expect(bucketOwner).toBe(args.bucketOwner);
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
    const args = {
      ...LenderArgs,
      heldToken,
      owedToken,
      trustedWithdrawers: [accounts[5], accounts[6]],
    };

    const { address: bucketLenderAddress }: any = await deployBucketLender(args);
    const lendAmount = new BigNumber('1e18');
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
    const positionId = dydx.margin.getPositionId(openTx.trader, openTx.nonce);
    const getPosition = await dydx.margin.getPosition(positionId);
    const currentTimestamp = getPosition.startTimestamp.add(5);
    allLent = await dydx.bucketLender.getLenderSummary(
      bucketLenderAddress,
      lender,
      { currentTimestamp },
    );
    expect(allLent.withdrawable).toEqual(lendAmount.times(2));
    expect(allLent.locked.isZero()).toBeFalsy();
  });

  it('deposits ETH in a bucket lender', async () => {
    const heldToken = await deployERC20(dydx, accounts);
    const args = {
      ...LenderArgs,
      heldToken,
      owedToken: dydx.contracts.WETH9.address,
      trustedWithdrawers: [accounts[5], accounts[6]],
      recoveryDelay: BIG_NUMBERS.ONE_DAY_IN_SECONDS,
    };
    const { address }: any = await deployBucketLenderWithDelay(args);
    const depositer = accounts[4];
    const bucketTotalBeforeDeposit = await dydx.bucketLender.getTotalAvailable(address);
    const amountToDeposit = new BigNumber('1e18');
    await dydx.bucketLender.depositETH(
      address,
      depositer,
      amountToDeposit,
    );
    const bucketTotalAfterDeposit = await dydx.bucketLender.getTotalAvailable(address);
    expect(bucketTotalBeforeDeposit.add(amountToDeposit).eq(bucketTotalAfterDeposit));
  });

  it('deposits tokens into bucket lender', async () => {
    const owedToken = await deployERC20(dydx, accounts);
    const args = {
      ...LenderArgs,
      owedToken,
      heldToken: dydx.contracts.WETH9.address,
      trustedWithdrawers: [accounts[5], accounts[6]],
      recoveryDelay: BIG_NUMBERS.ONE_DAY_IN_SECONDS,
    };
    const { address }: any = await deployBucketLenderWithDelay(args);
    const depositer = accounts[4];
    issueAndSetAllowance(
      owedToken,
      depositer,
      new BigNumber('40e18'),
      dydx.contracts.BucketLenderProxy.address,
    );
    const bucketTotalBeforeDeposit = await dydx.bucketLender.getTotalAvailable(address);
    const amountToDeposit = new BigNumber('1e18');
    await dydx.bucketLender.deposit(
      address,
      depositer,
      amountToDeposit,
    );
    const bucketTotalAfterDeposit = await dydx.bucketLender.getTotalAvailable(address);
    expect(bucketTotalBeforeDeposit.add(amountToDeposit).eq(bucketTotalAfterDeposit));
  });

  it('can deposit and withdraw ETH using EthWrapperForBucketLender', async () => {
    const heldToken = await deployERC20(dydx, accounts);
    const args = {
      ...LenderArgs,
      heldToken,
      owedToken: dydx.contracts.WETH9.address,
      trustedWithdrawers: [dydx.contracts.ethWrapperForBucketLender.address],
      recoveryDelay: BIG_NUMBERS.ONE_DAY_IN_SECONDS,
    };
    const { address }: any = await deployBucketLender(args);
    const amountToDeposit = new BigNumber('1e18');
    const depositer = accounts[4];
    const bucketTotalBeforeDeposit = await dydx.bucketLender.getTotalAvailable(address);
    await dydx.bucketLender.depositETHV1(
      address,
      depositer,
      depositer,
      amountToDeposit,
    );
    const bucketTotalAfterDeposit = await dydx.bucketLender.getTotalAvailable(address);
    expect(bucketTotalBeforeDeposit.add(amountToDeposit).eq(bucketTotalAfterDeposit));
    await withdrawAllETHV1(address, depositer);
    const bucketTotalAfterWithdraw = await dydx.bucketLender.getTotalAvailable(address);
    expect(bucketTotalAfterDeposit.sub(bucketTotalAfterWithdraw)
      .eq(amountToDeposit)).toBeTruthy();
  });
});
