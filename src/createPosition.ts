import { DYDX } from './DYDX';
import { TestToken as TestToken2 } from '@dydxprotocol/protocol';
import Web3Utils from 'web3-utils';
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
// console.log(process.cwd())
// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
web3.eth.defaultAccount = web3.eth.accounts[0];
const { BIGNUMBERS } = require('./Constants');
// Compile the source code

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
function deployERC20() {
  return new Promise((resolve, reject) => {
    const HeldTokenInstance = contract.new({
      data: '0x' + bytecode,
      from: web3.eth.coinbase,
      gas: 1000000
    },(err,res) => {
      if(err) reject(err);

      if(res.address) {
        resolve(res.address);
      }
    })
  })
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
  let HeldToken = await deployERC20();
  let OwedToken = await deployERC20();
  const accounts = await getAccounts();
  console.log(HeldToken, OwedToken);

  //console.log(dydx.contracts.proxy.address);
  //console.log(accounts);
  //
  const trader = accounts[1];
  const positionOwner = accounts[2];
  const loanOwner =  accounts[3];
  const deposit =  new BigNumber('1098765932109876543');
  const principal = new BigNumber('2387492837498237491');
  const nonce = new BigNumber('19238');
  const callTimeLimit = BIGNUMBERS.ONE_DAY_IN_SECONDS;
  const maxDuration = BIGNUMBERS.ONE_YEAR_IN_SECONDS;
  const interestRate = new BigNumber('600000');
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
      interestPeriod);
      console.log(openedPosition);

//     console.log(openedPosition);
 const isThere = await dydx.margin.containsPosition(openedPosition.id);
 console.log('Position has been stored', isThere);
}
// unclear if i need this just yet
async function issueAndSetAllowance(
  token,
  account,
  amount,
  allowed
) {
  const tokenInstance = contract.at(token);
  try{
  await Promise.all([
    tokenInstance.issueTo(account, amount),
    tokenInstance.approve(allowed, amount, { from: account })
  ]); } catch(err) {
    console.log(err);
  }
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
