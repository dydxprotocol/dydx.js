import Web3 from 'web3';
import { DYDX } from '../src/DYDX';
import { initializeInstance } from './helpers/DYDX';
import { resetEVM } from './helpers/SnapshotHelper';

let dydx;

describe('Contracts#setupContract', async () => {

  beforeEach(async () => {
    await resetEVM();
    dydx = new DYDX();
  });

  it('should initialize contracts with 300 second timeout', async () => {
    const synchronizationTimeout = 300000;
    await initializeInstance(
      dydx,
      new Web3.providers.HttpProvider(process.env.GANACHE_URL),
      Number(process.env.TEST_NETWORK_ID),
      { synchronizationTimeout },
    );
    expect(dydx.contracts.Margin.synchronization_timeout).toBe(synchronizationTimeout);
  });

  it('should initialize contracts to 240 seconds if not specified', async () => {
    await initializeInstance(
      dydx,
      new Web3.providers.HttpProvider(process.env.GANACHE_URL),
      Number(process.env.TEST_NETWORK_ID),
    );
    expect(dydx.contracts.Margin.synchronization_timeout).toBe(undefined);
  });
});
