declare var require: any;
declare var it: any;
declare var describe: any;
declare var beforeAll: any;
declare var expect: any;

import { dydx } from './helpers/DYDX';
import { BIG_NUMBERS, ADDRESSES, ENVIRONMENT } from './helpers/Constants';
import {
  callOpenWithoutCounterparty,
  issueAndSetAllowance,
  getBalances,
  setup,
  validate,
  setupDYDX,
} from './helpers/MarginHelper';
import bluebird from 'bluebird';
import chai from 'chai';
import web3 from 'web3';
chai.use(require('chai-bignumber')());

 // Connect to local Ethereum node
const web3Instance = new web3(new web3.providers.HttpProvider(ENVIRONMENT.GANACHE_URL));
bluebird.promisifyAll(web3Instance.eth);
web3Instance.eth.defaultAccount = web3Instance.eth.accounts[0];
let accounts = null;

describe('#openWithoutCounterparty', () => {
  beforeAll(async () => {
    setupDYDX(web3Instance.currentProvider);
    accounts = await web3Instance.eth.getAccountsAsync();
  });

  it('succeeds on valid inputs', async () => {
    const openTx = await setup(accounts);
    const [
      traderHeldTokenBalance,
      vaultHeldTokenBalance,
    ] = await getBalances(
        openTx.heldToken,
        [openTx.trader, dydx.contracts.Vault.address],
    );

    const tx = await callOpenWithoutCounterparty(openTx);
    await validate(openTx, tx.id, traderHeldTokenBalance, vaultHeldTokenBalance);
  });

  it('succeeds if different nonces are used', async () => {
    const openTx1 = await setup(accounts);
    const [
      traderHeldTokenBalance1,
      vaultHeldTokenBalance1,
    ] = await getBalances(
        openTx1.heldToken,
        [openTx1.trader, dydx.contracts.Vault.address],
    );

    const tx1 = await callOpenWithoutCounterparty(openTx1);
    await validate(openTx1, tx1.id, traderHeldTokenBalance1, vaultHeldTokenBalance1);

    const openTx2 = await setup(accounts);
    const [
      traderHeldTokenBalance2,
      vaultHeldTokenBalance2,
    ] = await getBalances(
        openTx2.heldToken,
        [openTx2.trader, dydx.contracts.Vault.address],
    );

    const tx2 = await callOpenWithoutCounterparty(openTx2);
    await validate(openTx2, tx2.id, traderHeldTokenBalance2, vaultHeldTokenBalance2);
  }, 10000);

  it('fails if positionId already exists', async () => {
    const openTx1 = await setup(accounts);
    const openTx2 = await setup(accounts);
    openTx2.nonce = openTx1.nonce;

    await callOpenWithoutCounterparty(openTx1);

    await expect(
       callOpenWithoutCounterparty(
         openTx2,
         { shouldContain: true },
       ),
     ).rejects.toThrow(/VM Exception while processing transaction: revert/);
     // works with different nonce
    openTx2.nonce = openTx1.nonce.plus(1);
    await callOpenWithoutCounterparty(openTx2);
  }, 10000);

  it('Fails if positionId already existed, but was closed', async () => {

    const openTx = await setup(accounts);
      // open first position
    const tx = await callOpenWithoutCounterparty(openTx);
    openTx.id = tx.id;

    await issueAndSetAllowance(
        openTx.owedToken,
        openTx.positionOwner,
        openTx.principal.times(2),
        dydx.contracts.Proxy.address,
      );

    await dydx.margin.closePositionDirectly(
          openTx.id,
          openTx.positionOwner,
          openTx.positionOwner,
          openTx.principal,
          { gas: 1000000 },
      );

    const closed = await dydx.margin.isPositionClosed(openTx.id);
    expect(closed).toBe(true);

    await expect(
       callOpenWithoutCounterparty(
         openTx,
         { shouldContain: true },
       ),
     ).rejects.toThrow(/VM Exception while processing transaction: revert/);

  }, 10000);

  it('can transfer position from one address to other', async () => {
    const openTx  = await setup(accounts);

    const receiver = accounts[5];

    const tx = await callOpenWithoutCounterparty(openTx);
    openTx.id = tx.id;

    await dydx.margin.transferPosition(
                        openTx.id,
                        receiver,
                        openTx.positionOwner);
    const positionTransferred = await dydx.margin.getPosition(openTx.id);

    expect(receiver).toEqual(positionTransferred.owner);
  });

   // Validations of the input
  it('fails if loan owner is 0', async () => {
    const openTx = await setup(accounts);
    openTx.loanOwner = ADDRESSES.ZERO;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if position owner is 0', async () => {
    const openTx = await setup(accounts);
    openTx.positionOwner = ADDRESSES.ZERO;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if principal is 0', async () => {
    const openTx = await setup(accounts);
    openTx.principal = BIG_NUMBERS.ZERO;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if owedToken is 0', async () => {
    const openTx = await setup(accounts);
    openTx.owedToken = ADDRESSES.ZERO;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if owedToken is equal to held token', async () => {
    const openTx = await setup(accounts);
    openTx.owedToken = openTx.heldToken;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if maxDuration is 0', async () => {
    const openTx = await setup(accounts);
    openTx.maxDuration = BIG_NUMBERS.ZERO;
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });

  it('fails if interestPeriod > maxDuration', async () => {
    const openTx = await setup(accounts);
    openTx.interestPeriod = openTx.maxDuration.plus(1);
    await expect(callOpenWithoutCounterparty(openTx))
          .rejects.toThrow(/VM Exception while processing transaction: revert/);
  });
});
