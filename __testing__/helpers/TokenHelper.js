declare var require: any
declare var process: any
const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');
chai.use(require('chai-bignumber')());
const BigNumber = require('bignumber.js');
import { dydx, setDYDXProvider } from './DYDX';
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
 web3.eth.defaultAccount = web3.eth.accounts[0];
 setDYDXProvider(web3.currentProvider);


//Deploy ERC20
async function deployERC20(accounts) {
    const token = await dydx.contracts.TestToken.new({ from: accounts[0], gas: 4712388});
    return token.address;
}
