import { resetEVM as protocolResetEVM } from '@dydxprotocol/protocol';
import Web3 from 'web3';

const provider = new Web3.providers.HttpProvider(process.env.GANACHE_URL);

export async function resetEVM() {
  await protocolResetEVM(provider);
}
