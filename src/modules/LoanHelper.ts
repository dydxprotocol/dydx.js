import { LoanOffering, SignedLoanOffering, Signature } from '../types';
import ethereumjsUtil from 'ethereumjs-util';
import Contracts from '../lib/Contracts';
import ethjs from 'ethjs';
import web3Utils from 'web3-utils';
import bluebird from 'bluebird';
import { SIGNATURE_TYPE } from '../lib/Constants';

export default class LoanHelper {
  private eth;

  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
  }

  public async signLoanOffering(loanOffering: LoanOffering): Promise<SignedLoanOffering> {
    const hash: string = this.getLoanOfferingHash(loanOffering);

    const signatureString: string = await this.eth.personal_signAsync(
      loanOffering.signer, hash,
    );

    const signature: Signature = ethereumjsUtil.fromRpcSig(signatureString);

    const signatureBytes = ethereumjsUtil.bufferToHex(
      Buffer.concat([
        ethereumjsUtil.toBuffer(SIGNATURE_TYPE.DEC),
        ethereumjsUtil.toBuffer(signature.v),
        signature.r,
        signature.s,
      ]),
    );

    const signedOffering: SignedLoanOffering = {
      ...loanOffering,
      signature: signatureBytes,
    };

    return signedOffering;
  }

  public getLoanOfferingHash(loanOffering: LoanOffering): string {
    const valuesHash = web3Utils.soliditySha3(
      loanOffering.maxAmount,
      loanOffering.minAmount,
      loanOffering.minHeldToken,
      loanOffering.lenderFee,
      loanOffering.takerFee,
      loanOffering.expirationTimestamp,
      loanOffering.salt,
      { type: 'uint32', value: loanOffering.callTimeLimit },
      { type: 'uint32', value: loanOffering.maxDuration },
      { type: 'uint32', value: loanOffering.interestRate },
      { type: 'uint32', value: loanOffering.interestPeriod },
    );
    return web3Utils.soliditySha3(
      this.contracts.margin.address,
      loanOffering.owedToken,
      loanOffering.heldToken,
      loanOffering.payer,
      loanOffering.signer,
      loanOffering.owner,
      loanOffering.taker,
      loanOffering.feeRecipient,
      loanOffering.lenderFeeTokenAddress,
      loanOffering.takerFeeTokenAddress,
      valuesHash,
    );
  }

  public setProvider(currentProvider) {
    this.eth = new ethjs(currentProvider);
    bluebird.promisifyAll(this.eth);
  }
}
