import { dydx } from './helpers/DYDX';
import { deployERC20 } from './helpers/TokenHelper';
import {
  LenderArgs,
  getBucketLenderCreatedEvent,
  isEthereumAddress,
} from './helpers/BucketLenderHelper';
import { setupDYDX } from './helpers/MarginHelper';
import { resetEVM } from './helpers/SnapshotHelper';
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

    expect(response.address).toBe(createdEvent.args.at);
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
    expect(owner).toBe(args.bucketOwner);
  });
});
