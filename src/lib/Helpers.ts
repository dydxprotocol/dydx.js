import BigNumber  from 'bignumber.js';
import web3Utils from 'web3-utils';
import { ContractFunction, Contract, Provider, ContractCallOptions } from '../types';

export function setupContract(
  contract: Contract,
  provider: Provider,
  networkId: number,
): void {
  contract.setProvider(provider);
  contract.setNetwork(networkId);
}

const AUTO_GAS_MULTIPLIER = 1.5;

export async function callContractFunction(
  func: ContractFunction,
  options: ContractCallOptions,
  ...args // tslint:disable-line: trailing-comma
): Promise<object> {
  if (!options.gas) {
    const gas = await func.estimateGas(...args, options);
    options.gas = Math.floor(gas * AUTO_GAS_MULTIPLIER);
  }
  return func(...args, options);
}

export function getPositionId(
  trader: string,
  nonce: BigNumber,
): string {
  return web3Utils.soliditySha3(
    trader,
    nonce,
  );
}
