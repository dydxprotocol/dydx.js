import web3Utils from 'web3-utils';
import ExchangeWrapper from './ExchangeWrapper';
import Contracts from '../../lib/Contracts';
import { ZeroExV2Order } from '../../types';

export default class ZeroExV2ExchangeWrapper extends ExchangeWrapper {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    super();
    this.contracts = contracts;
  }

  public getAddress() {
    return this.contracts.zeroExV2ExchangeWrapper.address;
  }

  public zeroExOrderToBytes(order: ZeroExV2Order): string {
    const v = []
      .concat(this.toBytes(order.makerAddress))
      .concat(this.toBytes(order.takerAddress))
      .concat(this.toBytes(order.feeRecipientAddress))
      .concat(this.toBytes(order.senderAddress))
      .concat(this.toBytes(order.makerAssetAmount))
      .concat(this.toBytes(order.takerAssetAmount))
      .concat(this.toBytes(order.makerFee))
      .concat(this.toBytes(order.takerFee))
      .concat(this.toBytes(order.expirationTimeSeconds))
      .concat(this.toBytes(order.salt))
      .concat(this.toBytes(order.signature));
    return web3Utils.bytesToHex(v);
  }

  private toBytes(val) {
    return web3Utils.hexToBytes(
      web3Utils.padLeft(web3Utils.toHex(val), 64),
    );
  }
}
