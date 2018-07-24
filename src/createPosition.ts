declare var require: any
declare var process: any
import { DYDX } from './DYDX';
import { TestToken as TestToken2 } from '@dydxprotocol/protocol';
import { Margin as MarginContract } from '@dydxprotocol/protocol';
import Web3Utils from 'web3-utils';
const fs =require('fs');
const solc = require('solc');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
 console.log(process.cwd())
// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.defaultAccount = web3.eth.accounts[0];
// Compile the source code
const BIGNUMBERS = {
    ZERO: new BigNumber(0),
    ONE_DAY_IN_SECONDS: new BigNumber(60 * 60 * 24),
    ONE_YEAR_IN_SECONDS: new BigNumber(60 * 60 * 24 * 365),
    ONES_127: new BigNumber("340282366920938463463374607431768211455"), // 2**128-1
    ONES_255: new BigNumber(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ), // 2**256-1
};

const input = fs.readFileSync('src/Token.sol');
const output = solc.compile(input.toString(), 1);
// const bytecode = TestToken2.bytecode;
// const abi = TestToken2.abi;
const bytecode = output.contracts[':TestToken'].bytecode;
const abi = JSON.parse(output.contracts[':TestToken'].interface);


// Contract object
const contract = web3.eth.contract(abi);
let dydx = null;
function setDYDXProvider(provider) {
  if (dydx == null) {
    dydx = new DYDX(provider, Number(1212));
  } else {
    dydx.setProvider(provider);
  }
}


//Deploy ERC20
async function deployERC20(accounts) {
console.log('Deploying..')
    const token = await dydx.contracts.TestToken.new({ from: accounts[0], gas: 4712388});
    console.log('Done')
    return token.address;
}

function getAccounts() {
  return new Promise((resolve,reject)=>{
    const accounts = web3.eth.getAccounts((err,res)=>{
      if(err) reject(err);
      else {
        resolve(res);
      }
    })
  })
}

async function openPositionWithoutCounterparty() {
  setDYDXProvider(web3.currentProvider);
  const accounts = await getAccounts();
  let HeldToken = await deployERC20(accounts);
  let OwedToken = await deployERC20(accounts);

  //console.log(dydx.contracts.proxy.address);
  //console.log(accounts);
  //
  const trader = accounts[6];
  const positionOwner = accounts[7];
  const loanOwner =  accounts[8];
  const deposit =  new BigNumber('1098765932109876543');
  const principal = new BigNumber('2387492837498237491');
  const nonce = new BigNumber('19239');
  const callTimeLimit = BIGNUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIGNUMBERS.ONE_YEAR_IN_SECONDS;
  const interestRate = new BigNumber('1');
  const interestPeriod = BIGNUMBERS.ONE_DAY_IN_SECONDS;


  //issue and set allowances of the tokens
  await issueAndSetAllowance(
      HeldToken,
      trader,
      deposit,
      dydx.contracts.proxy.address);

//get the starting balances
  const startingBalances = await getBalances(HeldToken, trader);

  let openedPosition;
  let myPos;

  console.log(dydx.contracts.proxy.address)
  console.log(trader)
  console.log(HeldToken)
  console.log(OwedToken)
  console.log(deposit.toString())
  console.log(dydx.contracts.proxy.address)
  console.log(nonce)

  openedPosition = await dydx.margin.openWithoutCounterparty(
      trader,
      positionOwner,
      loanOwner,
      OwedToken,
      HeldToken,
      nonce,
      deposit,
      principal,
      callTimeLimit,
      maxDuration,
      interestRate,
      interestPeriod,
      { gas: 1000000 }
  );
      console.log(openedPosition);
      console.log(openedPosition.receipt.logs);
 //
 //    console.log(openedPosition);
 // const isThere = await dydx.margin.containsPosition(openedPosition.id);
 // console.log('Position has been stored', isThere);
}
// unclear if i need this just yet
async function issueAndSetAllowance(
  token,
  account,
  amount,
  allowed
) {
  const tokenInstance = contract.at(token);
  await Promise.all([
    tokenInstance.issueTo(account, amount),
    tokenInstance.approve(allowed, amount, { from: account })
  ]);
}

async function getBalances(tokenAddress,trader ) {
  const heldToken = contract.at(tokenAddress);
  const [
    traderHeldToken,
    vaultHeldToken
  ] = await Promise.all([
    heldToken.balanceOf.call(trader),
    heldToken.balanceOf.call(dydx.contracts.vault.address),
  ]);

  return { traderHeldToken, vaultHeldToken };
}

// Deploy contract instance
//
openPositionWithoutCounterparty();
