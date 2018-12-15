import web3Utils from 'web3-utils';
import BigNumber from 'bignumber.js';
import ExchangeWrapper from './ExchangeWrapper';
import Contracts from '../../lib/Contracts';

export default class OasisV2SimpleExchangeWrapper extends ExchangeWrapper {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    super();
    this.contracts = contracts;
  }

  public getAddress() {
    return this.contracts.oasisV2SimpleExchangeWrapper.address;
  }

  public orderIdToBytes(orderId: string): string {
    const bnid = new BigNumber(orderId);
    return web3Utils.bytesToHex(this.toBytes(bnid));
  }

  private toBytes(val) {
    return web3Utils.hexToBytes(
      web3Utils.padLeft(web3Utils.toHex(val), 64),
    );
  }
}
