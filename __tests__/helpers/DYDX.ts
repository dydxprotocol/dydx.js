import { DYDX } from '../../src/DYDX';
import { Provider, DYDXOptions } from '../../src/types';
import Web3 from 'web3';

export const dydx = new DYDX();

export async function initialize(
  provider: Provider,
  networkID: number,
  options?: DYDXOptions,
) {
  await dydx.initialize(
    provider,
    networkID,
    options,
  );
}

export async function initializeInstance(
  dydxInstance: any,
  provider: Provider,
  networkID: number,
  options?: DYDXOptions,
) {
  await dydxInstance.initialize(
    provider,
    networkID,
    options,
  );
}
