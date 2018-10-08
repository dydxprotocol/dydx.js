import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { dydx, initialize } from './DYDX';
import { deployERC20 } from './TokenHelper';
import { BIG_NUMBERS } from '../../src/lib/Constants';
import web3Utils from 'web3-utils';

export let testTokenContract = null;

export async function callOpenWithoutCounterparty(
  openTx,
  { shouldContain = false } = {},
) : Promise<any> {
  const positionId = web3Utils.soliditySha3(
    openTx.trader,
    openTx.nonce,
  );

  let contains;

  if (!shouldContain) {
    contains = await dydx.margin.containsPosition(positionId);
    expect(contains).toBeFalsy();
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

export async function getBalances(tokenAddress, holders):Promise<any []> {
  const heldToken = testTokenContract.at(tokenAddress);
  const balances = holders.map(holder => heldToken.balanceOf.call(holder));
  const result = await Promise.all(balances);

  return result;
}

export async function setup(accounts) {
  const trader = accounts[1];
  const loanOwner = accounts[2];
  const positionOwner = accounts[2];

  const heldToken = await deployERC20(dydx, accounts);
  const owedToken = await deployERC20(dydx, accounts);

  const deposit   = new BigNumber('10000000000000');
  const principal = new BigNumber('200000000000000');
  const nonce = new BigNumber(Math.floor(Math.random() * 100000000));

  const callTimeLimit = BIG_NUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIG_NUMBERS.ONE_YEAR_IN_SECONDS;

  const interestRate = new BigNumber(0.07);
  const interestPeriod = BIG_NUMBERS.ONE_DAY_IN_SECONDS;

  await issueAndSetAllowance(
    heldToken,
    trader,
    /* need to have extra in order for the contract not to throw */
    deposit.mul(3),
    dydx.contracts.TokenProxy.address,
  );

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

async function setupTestContract() {
  const [defaultAccount] = await dydx.contracts.web3.eth.getAccountsAsync();
  testTokenContract = dydx.contracts.TestToken;
  testTokenContract.setProvider(new Web3.providers.HttpProvider(process.env.GANACHE_URL));
  testTokenContract.setNetwork(Number(process.env.TEST_NETWORK_ID));
  testTokenContract.defaults({ from: defaultAccount });
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

  expect(position.owner).toEqual(openTx.positionOwner);
  expect(position.lender).toEqual(openTx.loanOwner);
  expect(position.owedToken).toEqual(openTx.owedToken);
  expect(position.heldToken).toEqual(openTx.heldToken);
  expect(position.principal.equals(openTx.principal)).toBeTruthy();
  expect(position.callTimeLimit.equals(openTx.callTimeLimit)).toBeTruthy();
  expect(position.maxDuration.equals(openTx.maxDuration)).toBeTruthy();
  expect(position.interestRate.equals(openTx.interestRate)).toBeTruthy();
  expect(position.interestPeriod.equals(openTx.interestPeriod)).toBeTruthy();
  expect(position.requiredDeposit.equals(BIG_NUMBERS.ZERO)).toBeTruthy();
  expect(position.callTimestamp.equals(BIG_NUMBERS.ZERO)).toBeTruthy();
  expect(positionBalance.equals(openTx.deposit)).toBeTruthy();
  expect(vaultHeldToken.equals(vaultHeldTokenBalance.plus(openTx.deposit))).toBeTruthy();
  expect(traderHeldToken.equals(
    traderHeldTokenBalance.minus(openTx.deposit),
  )).toBeTruthy();
}

export async function setupDYDX(
  synchronizationTimeout?: number,
) {
  await initialize(
    new Web3.providers.HttpProvider(process.env.GANACHE_URL),
    Number(process.env.TEST_NETWORK_ID),
    { synchronizationTimeout },
  );
  await setupTestContract();
}
