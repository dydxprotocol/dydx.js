export async function deployERC20(dydx, accounts) {
  const token = await dydx.contracts.TestToken.new({ from: accounts[0], gas: 4712388 });
  return token.address;
}
