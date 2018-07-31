export function setupContract(
  contract,
  provider,
  networkId: number,
) {
  contract.setProvider(provider);
  contract.setNetwork(networkId);
}

const AUTO_GAS_MULTIPLIER = 1.5;
export async function callContractFunction(func, options: any = {}, ...args) {
  if (!options.gas) {
    const gas = await func.estimateGas(...args, options);
    options.gas = Math.floor(gas * AUTO_GAS_MULTIPLIER);
  }
  return func(...args, options);
}
