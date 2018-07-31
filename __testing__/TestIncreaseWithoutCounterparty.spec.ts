declare var require: any;
declare var it: any;
declare var describe: any;
declare var beforeAll: any;
declare var expect: any;
import { dydx } from './helpers/DYDX';
import {
  callIncreaseWithoutCounterparty,
  callOpenWithoutCounterparty,
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

  it.only('increases a position from position owner', async () => {
    const openTx = await setup(accounts);
    const [
      traderHeldTokenBalanceBefore,
      vaultHeldTokenBalanceBefore
    ] = await getBalances(
      openTx.heldToken,
      [openTx.trader, dydx.contracts.Vault.address],
    );

    const positionTx = await callOpenWithoutCounterparty(openTx);

    const principalToAdd = new BigNumber('100000');
    await callIncreaseWithoutCounterparty(
                             positionTx.id,
                             principalToAdd,
                             openTx.positionOwner
                           );
    const [
      traderHeldTokenBalanceAfter,
      vaultHeldTokenBalanceAfter
    ] = await getBalances(
      openTx.heldToken,
      [openTx.trader, dydx.contracts.Vault.address],
    );

    expect(vaultHeldTokenBalanceBefore.plus(principalToAdd)).to.be.bignumber.eq(vaultHeldTokenBalanceAfter);
    expect(traderHeldTokenBalanceBefore.minus(principalToAdd)).to.be.bignumber.eq(traderHeldTokenBalanceAfter);


  });
});
