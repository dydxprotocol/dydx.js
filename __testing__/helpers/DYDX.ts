import { DYDX } from '../../src/DYDX';
import Web3 from 'web3';

export const dydx = new DYDX();

export async function initialize() {
  await dydx.initialize(
    new Web3.providers.HttpProvider(process.env.GANACHE_URL),
    Number(process.env.TEST_NETWORK_ID),
  );
}
