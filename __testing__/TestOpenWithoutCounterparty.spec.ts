declare var require: any
declare var process: any
const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');
chai.use(require('chai-bignumber')());
const BigNumber = require('bignumber.js');
import { DYDX } from '../src/DYDX';
import { BIGNUMBERS, ADDRESSES } from './helpers/Constants';
import bluebird from 'bluebird';
const web3utils = require('web3-utils');
const fs =require('fs');
// const solc = require('solc');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const { expectThrow } = require('./helpers/ExpectHelper');


 // Connect to local Ethereum node
 const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
 bluebird.promisifyAll(web3.eth);
 web3.eth.defaultAccount = web3.eth.accounts[0];

 //dydx --> dydx.js library
 //TestTokenContract --> TestToken contract from dydx
 //accounts --> list of accounts
 let dydx = null;
 let TestTokenContract = null;
 let accounts = null

/**
 * having a little trouble using the dYdX contract's TestToken,
 * so for now using the TestToken from the contract
 */

 describe('#openWithoutCounterparty', ()=>{
   beforeAll( async () => {
     setDYDXProvider(web3.currentProvider);
     accounts = await web3.eth.getAccountsAsync();
   });


   it('succeeds on valid inputs', async () => {
     const openTx = await setup(accounts);

     const startingBalances = await getBalances(openTx);

     const tx = await callOpenWithoutCounterparty(openTx);


      await validate(openTx, tx, startingBalances);
   });

   it('succeeds if different nonces are used', async () => {
     const openTx1 = await setup(accounts);
     const startBalance1 = await getBalances(openTx1);
     const tx1 = await callOpenWithoutCounterparty(openTx1);
     await validate(openTx1, tx1, startBalance1);

     const openTx2 = await setup(accounts);
     const startBalance2 = await getBalances(openTx2);
     const tx2 = await callOpenWithoutCounterparty(openTx2);
     await validate(openTx2, tx2, startBalance2);
   }, 10000);

   it('fails if positionId already exists', async () => {
     const openTx1 = await setup(accounts);
     const openTx2 = await setup(accounts);
     openTx2.nonce = openTx1.nonce;

     await callOpenWithoutCounterparty(openTx1);

     await expectThrow(
       callOpenWithoutCounterparty(
         openTx2,
         { shouldContain: true }
       )
     );
     //works with different nonce
     openTx2.nonce = openTx1.nonce.plus(1);
     await callOpenWithoutCounterparty(openTx2);
   }, 10000);

   it('Fails if positionId already existed, but was closed', async () => {

      const openTx = await setup(accounts);
      //open first position
      const tx = await callOpenWithoutCounterparty(openTx);
      openTx.id = tx.id;

      await issueAndSetAllowance(
        openTx.owedToken,
        openTx.positionOwner,
        openTx.principal.times(2),
        dydx.contracts.proxy.address
      );

      await dydx.margin.closePositionDirectly(
          openTx.id,
          openTx.positionOwner,
          openTx.positionOwner,
          openTx.principal,
          { gas: 1000000 }
      );

      const closed = await dydx.margin.isPositionClosed(openTx.id);
      expect(closed).to.be.true;

   }, 10000);

   // it.only('fails if loan owner is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.loanOwner = ADDRESSES.ZERO;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // });

   // it('fails if loan owner is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.positionOwner = ADDRESSES.ZERO;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // });
   //
   // it('fails if principal is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.principal = BIGNUMBERS.ZERO;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // });
   //
   // it('fails if owedToken is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.owedToken = ADDRESSES.ZERO;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // })
   //
   // it('fails if owedToken is equal to held token', async () => {
   //   const openTx = setup(accounts);
   //   openTx.owedToken = openTx.heldToken;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // });
   //
   // it('fails if maxDuration is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.maxDuration = 0;
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // })
   //
   // it('fails if interestPeriod > maxDuration is 0', async () => {
   //   const openTx = setup(accounts);
   //   openTx.interestPeriod = openTx.maxDuration.plus(1);
   //   await expectThrow(callOpenWithoutCounterparty(openTx));
   // })




 })
 /**
  * Helper Functions
  */
 //callOpenWithoutCounterparty
 async function callOpenWithoutCounterparty(
  openTx,
  { shouldContain = false } = {}
) {
    const positionId = web3utils.soliditySha3(
      openTx.trader,
      openTx.nonce
    );

    let contains;

    if(!shouldContain) {
      contains = await dydx.margin.containsPosition(positionId);
      expect(contains).to.be.false;
    }

    const response =  await dydx.margin.openWithoutCounterparty(
      openTx.trader,
      openTx.positionOwner,
      openTx.loanOwner,
      openTx.owedToken,
      openTx.heldToken,
      openTx.nonce,
      openTx.deposit,
      openTx.principal,
      openTx.callTimeLimit,
      openTx.maxDuration,
      openTx.interestRate,
      openTx.interestPeriod,
      { gas: 1000000 }
    );

    contains = await dydx.margin.containsPosition(positionId);
    expect(contains).to.be.true;

    //something with expecting log

    return response;
}

 //Issue and set allowance with TestToken
 async function issueAndSetAllowance(
   token,
   account,
   amount,
   allowed
 ) {
   const tokenInstance = TestTokenContract.at(token);
   await Promise.all([
     tokenInstance.issueTo(account, amount),
     tokenInstance.approve(allowed, amount, { from: account })
   ]);
 }



 async function getBalances(openTx) {
   const heldToken = TestTokenContract.at(openTx.heldToken);
   const [
     traderHeldToken,
     vaultHeldToken
   ] = await Promise.all([
     heldToken.balanceOf.call(openTx.trader),
     heldToken.balanceOf.call(dydx.contracts.vault.address),
   ]);

   return { traderHeldToken, vaultHeldToken };
 }

 //Deploy ERC20
 async function deployERC20(accounts) {
     const token = await dydx.contracts.TestToken.new({ from: accounts[0], gas: 4712388});
     return token.address;
 }

async function setup(accounts) {
  const trader = accounts[1];
  const loanOwner = accounts[2];
  const positionOwner = accounts[3];

  const heldToken = await deployERC20(accounts);
  const owedToken = await deployERC20(accounts);

  const deposit   = new BigNumber('1098765932109876543');
  const principal = new BigNumber('2387492837498237491');
  const nonce = new BigNumber(Math.floor(Math.random()*1000000));

  const callTimeLimit = BIGNUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIGNUMBERS.ONE_YEAR_IN_SECONDS;

  const interestRate = new BigNumber('7');
  const interestPeriod = BIGNUMBERS.ONE_DAY_IN_SECONDS;

  await issueAndSetAllowance(
      heldToken,
      trader,
      deposit,
      dydx.contracts.proxy.address);

  return {
    trader,
    positionOwner,
    loanOwner,
    owedToken,
    heldToken,
    deposit,
    principal,
    nonce,
    callTimeLimit,
    maxDuration,
    interestRate,
    interestPeriod
  };
}
async function validate(openTx, tx, startingBalances) {
  const [
    position,
    positionBalance,
    { traderHeldToken, vaultHeldToken }
  ] = await Promise.all([
    dydx.margin.getPosition(tx.id),
    dydx.margin.getPositionBalance(tx.id),
    getBalances(openTx)
  ]);

  expect(position.owner).to.be.eq(openTx.positionOwner);
  expect(position.lender).to.be.eq(openTx.loanOwner);
  expect(position.owedToken).to.be.eq(openTx.owedToken);
  expect(position.heldToken).to.be.eq(openTx.heldToken);
  expect(position.principal).to.be.bignumber.eq(openTx.principal);
  expect(position.callTimeLimit).to.be.bignumber.eq(openTx.callTimeLimit);
  expect(position.maxDuration).to.be.bignumber.eq(openTx.maxDuration);
  expect(position.interestRate).to.be.bignumber.eq(openTx.interestRate);
  expect(position.interestPeriod).to.be.bignumber.eq(openTx.interestPeriod);
  expect(position.requiredDeposit).to.be.bignumber.eq(BIGNUMBERS.ZERO);
  expect(position.callTimestamp).to.be.bignumber.eq(BIGNUMBERS.ZERO);
  expect(positionBalance).to.be.bignumber.eq(openTx.deposit);
  expect(vaultHeldToken).to.be.bignumber.eq(startingBalances.vaultHeldToken.plus(openTx.deposit));
  expect(traderHeldToken).to.be.bignumber.eq(
    startingBalances.traderHeldToken.minus(openTx.deposit)
  );
}

 function setDYDXProvider(provider) {
   if (dydx === null) {
     dydx = new DYDX(provider, Number(1212));
   } else {
     dydx.setProvider(provider);
   }
   TestTokenContract = web3.eth.contract(dydx.contracts.TestToken.abi);
 }
