import web3Utils from 'web3-utils';
import ExchangeWrapper from './ExchangeWrapper';
import Contracts from '../../lib/Contracts';
import { ZeroExOrder } from '../../types';

export default class ZeroExExchangeWrapper extends ExchangeWrapper {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    super();
    this.contracts = contracts;
  }

  public getAddress() {
    return this.contracts.zeroExExchangeWrapper.address;
  }

  public zeroExOrderToBytes(order: ZeroExOrder): string {
    const v = [].concat(this.toBytes(order.maker))
      .concat(this.toBytes(order.taker))
      .concat(this.toBytes(order.feeRecipient))
      .concat(this.toBytes(order.makerTokenAmount))
      .concat(this.toBytes(order.takerTokenAmount))
      .concat(this.toBytes(order.makerFee))
      .concat(this.toBytes(order.takerFee))
      .concat(this.toBytes(order.expirationUnixTimestampSec))
      .concat(this.toBytes(order.salt))
      .concat(this.toBytes(order.ecSignature.v))
      .concat(this.toBytes(order.ecSignature.r))
      .concat(this.toBytes(order.ecSignature.s));

    return web3Utils.bytesToHex(v);
  }

  private toBytes(val) {
    return web3Utils.hexToBytes(
      web3Utils.padLeft(web3Utils.toHex(val), 64),
    );
  }
}
