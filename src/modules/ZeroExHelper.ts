export class ZeroExHelper {
    private web3;

    private marginAddress: string;

    constructor(
        web3
    ) {
        this.web3 = web3;
    }

    private toBytes(val) {
      return this.web3.utils.hexToBytes(
        this.web3.utils.padLeft(this.web3.utils.toHex(val), 64)
      );
    }

    public orderToBytes(order) {
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
      return this.web3.utils.bytesToHex(v);
    }
}
