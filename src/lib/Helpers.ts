import BigNumber  from 'bignumber.js';
import web3Utils from 'web3-utils';
import { Contract, Provider } from '../types';

export function setupContract(
  contract: Contract,
  provider: Provider,
  networkId: number,
): void {
  contract.setProvider(provider);
  contract.setNetwork(networkId);
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
