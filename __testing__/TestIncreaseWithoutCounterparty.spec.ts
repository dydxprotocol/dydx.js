import { dydx } from './helpers/DYDX';
import {
  issueAndSetAllowance,
  callOpenWithoutCounterparty,
  getBalances,
  setup,
  setupDYDX,
} from './helpers/MarginHelper';
import BigNumber from 'bignumber.js';
import { resetEVM } from './helpers/SnapshotHelper';

let accounts = null;

describe('#increaseWithoutCounterparty', () => {
  beforeAll(async () => {
    await setupDYDX();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  beforeEach(async () => {
    await resetEVM();
  });

  it('increases a position from position owner', async () => {
    const openTx = await setup(accounts);

    const positionTx =  await callOpenWithoutCounterparty(openTx);

    const principalToAdd = new BigNumber('1000');
    const [
      loanHeldTokenBalanceAfterOpen,
      vaultHeldTokenBalanceAfterOpen,
    ] = await getBalances(
      openTx.heldToken,
      [openTx.loanOwner, dydx.contracts.Vault.address],
    );
    expect(loanHeldTokenBalanceAfterOpen).toEqual(new BigNumber(0));
    expect(vaultHeldTokenBalanceAfterOpen).toEqual(openTx.deposit);

    const leftOverAmount: BigNumber = new BigNumber(10000);
    const issueLoaner: BigNumber = principalToAdd.div(openTx.principal).times(openTx.deposit);

    await issueAndSetAllowance(
          openTx.heldToken,
          openTx.loanOwner,
          issueLoaner.add(leftOverAmount),
          dydx.contracts.TokenProxy.address,
    );

    const [loanHeldTokenBalanceBeforeIncrease]
                = await getBalances(openTx.heldToken, [openTx.loanOwner]);
    expect(loanHeldTokenBalanceBeforeIncrease).toEqual(issueLoaner.plus(leftOverAmount));

    await dydx.margin.increaseWithoutCounterparty(
      positionTx.id,
      principalToAdd,
      openTx.loanOwner,
    );
    const [
      loanHeldTokenBalanceAfterIncrease,
      vaultHeldTokenBalanceAfterIncrease,
    ] = await getBalances(
      openTx.heldToken,
      [openTx.loanOwner, dydx.contracts.Vault.address],
    );
    expect(loanHeldTokenBalanceAfterIncrease).toEqual(leftOverAmount);
    expect(vaultHeldTokenBalanceAfterIncrease)
          .toEqual(vaultHeldTokenBalanceAfterOpen.plus(issueLoaner));

  }, 18000);
});
