import { DYDX } from '../../src/DYDX';
import bluebird from 'bluebird';
const web3utils = require('web3-utils');
const fs =require('fs');
// const solc = require('solc');
export let dydx = null;

export function setDYDXProvider(provider) {
  if (dydx === null) {
    dydx = new DYDX(provider, Number(1212));
  } else {
    dydx.setProvider(provider);
  }
  // TestTokenContract = web3.eth.contract(dydx.contracts.TestToken.abi);
}
