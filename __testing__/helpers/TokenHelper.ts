declare var require: any;
declare var process: any;
import { expectThrow } from './ExpectHelper';

export async function deployERC20(dydx, accounts) {
  const token = await dydx.contracts.TESTTOKEN.new({ from: accounts[0], gas: 4712388 });
  return token.address;
}
