declare var require: any;
declare var process: any;
import { dydx, setDYDXProvider } from './DYDX';
const WEB3 = require('web3');
const { expectThrow } = require('./ExpectHelper');

 // Connect to local Ethereum node
const web3Instance = new WEB3(new WEB3.providers.HttpProvider('http://localhost:8545'));
web3Instance.eth.defaultAccount = web3Instance.eth.accounts[0];
setDYDXProvider(web3Instance.currentProvider);

// Deploy ERC20
export async function deployERC20(accounts) {
  const token = await dydx.contracts.TESTTOKEN.new({ from: accounts[0], gas: 4712388 });
  return token.address;
}
