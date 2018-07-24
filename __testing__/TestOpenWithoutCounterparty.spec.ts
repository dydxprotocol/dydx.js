declare var require: any
declare var process: any
const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');
chai.use(require('chai-bignumber')());
const BigNumber = require('bignumber.js');
import { DYDX } from '../src/DYDX';
import { BIGNUMBERS } from './helpers/Constants';
import bluebird from 'bluebird';
const web3utils = require('web3-utils');
const fs =require('fs');
// const solc = require('solc');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');


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

   it("should return true",()=> {
     expect(true==true).to.be.true;
   });

   it('succeeds on valid inputs', async () => {
     const openTx = await setup(accounts);

     const startingBalances = await getBalances(openTx.heldToken, openTx.trader);

     const tx = await callOpenWithoutCounterparty(openTx);


     expect(true==true).to.be.true;
   });


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

    response.id = positionId;

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

 async function getBalances(tokenAddress,trader ) {
   const heldToken = TestTokenContract.at(tokenAddress);
   const [
     traderHeldToken,
     vaultHeldToken
   ] = await Promise.all([
     heldToken.balanceOf.call(trader),
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
  const nonce = new BigNumber('19238');

  const callTimeLimit = BIGNUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIGNUMBERS.ONE_YEAR_IN_SECONDS;

  const interestRate = new BigNumber('600000');
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

 function setDYDXProvider(provider) {
   if (dydx === null) {
     dydx = new DYDX(provider, Number(1212));
   } else {
     dydx.setProvider(provider);
   }
   TestTokenContract = web3.eth.contract(dydx.contracts.TestToken.abi);
 }
