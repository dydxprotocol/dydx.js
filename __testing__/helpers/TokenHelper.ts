declare var require: any;
declare var process: any;
import { dydx, setDYDXProvider } from './DYDX';
import web3 from 'web3';
import { expectThrow } from './ExpectHelper';

 // Connect to local Ethereum node
const web3Instance = new web3(new web3.providers.HttpProvider('http://localhost:8545'));
web3Instance.eth.defaultAccount = web3Instance.eth.accounts[0];
setDYDXProvider(web3Instance.currentProvider);

// Deploy ERC20
export async function deployERC20(accounts) {
  const token = await dydx.contracts.TESTTOKEN.new({ from: accounts[0], gas: 4712388 });
  return token.address;
}
