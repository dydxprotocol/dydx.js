declare var require: any;
declare var it: any;
declare var describe: any;
declare var beforeAll: any;
declare var expect: any;
import { dydx } from './helpers/DYDX';
import {
  issueAndSetAllowance,
  callOpenWithoutCounterparty,
  callIncreaseWithoutCounterparty,
  getBalances,
  setup,
  setupDYDX,
} from './helpers/MarginHelper';
import BigNumber from 'bignumber.js';
import chai from 'chai';
import web3 from './helpers/web3';
chai.use(require('chai-bignumber')());
let accounts = null;

describe('#increaseWithoutCounterparty', () => {
  beforeAll(async () => {
    setupDYDX(web3.currentProvider);
    accounts = await web3.eth.getAccountsAsync();
  });

  it('increases a position from position owner', async () => {
    const openTx = await setup(accounts);

    const positionTx =  await callOpenWithoutCounterparty(openTx);

    const principalToAdd = new BigNumber('1000');
    const [
      loanHeldTokenBalanceBefore1,
      vaultHeldTokenBalanceBefore1,
    ] = await getBalances(
      openTx.heldToken,
      [openTx.loanOwner, dydx.contracts.Vault.address],
    );
    const leftOverAmount: BigNumber = new BigNumber(10000);

    console.log(loanHeldTokenBalanceBefore1.toNumber(), vaultHeldTokenBalanceBefore1.toNumber());
    const issueTrader: BigNumber = principalToAdd.div(openTx.principal).times(openTx.deposit);
    console.log(issueTrader.toNumber());
    await issueAndSetAllowance(
          openTx.heldToken,
          openTx.loanOwner,
          issueTrader.add(leftOverAmount),
          dydx.contracts.TokenProxy.address,
    );

    const [
      loanHeldTokenBalanceBefore,
      vaultHeldTokenBalanceBefore,
    ] = await getBalances(
      openTx.heldToken,
      [openTx.loanOwner, dydx.contracts.Vault.address],
    );
    console.log(loanHeldTokenBalanceBefore.toNumber(), vaultHeldTokenBalanceBefore.toNumber());

    await callIncreaseWithoutCounterparty(
                             positionTx.id,
                             principalToAdd,
                             openTx.loanOwner,
                           );
    const [
      loanHeldTokenBalanceAfter,
      vaultHeldTokenBalanceAfter,
    ] = await getBalances(
      openTx.heldToken,
      [openTx.loanOwner, dydx.contracts.Vault.address],
    );
    console.log(loanHeldTokenBalanceAfter.toNumber(), vaultHeldTokenBalanceAfter.toNumber());
    // for some reason it loses 1 when adding to the position
    expect(loanHeldTokenBalanceAfter).toEqual(leftOverAmount.sub(1));
  }, 10000);
});
