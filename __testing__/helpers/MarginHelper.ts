import { BigNumber } from 'bignumber.js';
import { dydx, setDYDXProvider } from './DYDX';
import { deployERC20 } from './TokenHelper';
import { BIG_NUMBERS, ENVIRONMENT } from './Constants';
import web3  from 'web3';
import web3Utils from 'web3-utils';
import chai from 'chai' ;
import expect = chai.expect;
 // Connect to local Ethereum node
const web3Instance = new web3(new web3.providers.HttpProvider(ENVIRONMENT.GANACHE_URL));
web3Instance.eth.defaultAccount = web3Instance.eth.accounts[0];
 // dydx --> dydx.js library
 // testTokenContract --> TestToken contract from dydx
 // accounts --> list of accounts
export let testTokenContract = null;

export async function callOpenWithoutCounterparty(
  openTx,
  { shouldContain = false } = {},
) {
  const positionId = web3Utils.soliditySha3(
      openTx.trader,
      openTx.nonce,
    );

  let contains;

  if (!shouldContain) {
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
      { gas: 1500000 },
    );

  contains = await dydx.margin.containsPosition(positionId);

  return response;
}

 // Issue and set allowance with TestToken
export async function issueAndSetAllowance(
   token,
   account,
   amount,
   allowed,
 ) {
  const tokenInstance = testTokenContract.at(token);
  await Promise.all([
    tokenInstance.issueTo(account, amount),
    tokenInstance.approve(allowed, amount, { from: account }),
  ]);
}

export async function getBalances(tokenAddress, holders) {
  const heldToken = testTokenContract.at(tokenAddress);
  const balances = holders.map(holder => heldToken.balanceOf.call(holder));
  const result = await Promise.all(balances);

  return result;
}

export async function setup(accounts) {
  const trader = accounts[1];
  const loanOwner = accounts[2];
  const positionOwner = accounts[3];

  const heldToken = await deployERC20(dydx, accounts);
  const owedToken = await deployERC20(dydx, accounts);

  const deposit   = new BigNumber('1098765932109876543');
  const principal = new BigNumber('2387492837498237491');
  const nonce = new BigNumber(Math.floor(Math.random() * 1000000));

  const callTimeLimit = BIG_NUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIG_NUMBERS.ONE_YEAR_IN_SECONDS;

  const interestRate = new BigNumber('7');
  const interestPeriod = BIG_NUMBERS.ONE_DAY_IN_SECONDS;

  await issueAndSetAllowance(
      heldToken,
      trader,
      deposit,
      dydx.contracts.Proxy.address);

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
    interestPeriod,
    id: null,
  };
}
export async function validate(openTx, txID, traderHeldTokenBalance, vaultHeldTokenBalance) {
  const [
    position,
    positionBalance,
    [traderHeldToken, vaultHeldToken],
  ] = await Promise.all([
    dydx.margin.getPosition(txID),
    dydx.margin.getPositionBalance(txID),
    getBalances(openTx.heldToken, [openTx.trader, dydx.contracts.Vault.address]),
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
  expect(position.requiredDeposit).to.be.bignumber.eq(BIG_NUMBERS.ZERO);
  expect(position.callTimestamp).to.be.bignumber.eq(BIG_NUMBERS.ZERO);
  expect(positionBalance).to.be.bignumber.eq(openTx.deposit);
  expect(vaultHeldToken).to.be.bignumber.eq(vaultHeldTokenBalance.plus(openTx.deposit));
  expect(traderHeldToken).to.be.bignumber.eq(
    traderHeldTokenBalance.minus(openTx.deposit),
  );
}

export function setupDYDX(provider) {
  setDYDXProvider(web3Instance.currentProvider);
  testTokenContract = web3Instance.eth.contract(dydx.contracts.TestToken.abi);
}
