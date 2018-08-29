import { dydx } from './helpers/DYDX';
import { deployERC20 } from './helpers/TokenHelper';
import {
  LenderArgs,
  setupDYDX,
 } from './helpers/MarginHelper';
import { resetEVM } from './helpers/SnapshotHelper';

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

    expect(response.logs[0].event).toBe('BucketLenderCreated');
  });
});