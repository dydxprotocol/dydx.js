import { LoanOffering, SignedLoanOffering, Signature } from '../types';
import ethUtil from 'ethereumjs-util';
import { Contracts } from '../lib/Contracts';
import Eth from 'ethjs';
import Web3Utils from 'web3-utils';
import bluebird from 'bluebird';

export class LoanHelper {
    private currentProvider;

    private contracts: Contracts;

    constructor(
        currentProvider,
        contracts: Contracts
    ) {
        this.currentProvider = currentProvider;
        this.contracts = contracts;
    }

    public async signLoanOffering(loanOffering: LoanOffering): Promise<SignedLoanOffering> {
        const hash: string = this.getLoanOfferingHash(loanOffering);

        const eth = new Eth(this.currentProvider);
        bluebird.promisifyAll(eth);

        const signatureString: string = await eth.personal_signAsync(
            loanOffering.signer, hash
        );

        const signature: Signature = ethUtil.fromRpcSig(signatureString);

        const signedOffering: SignedLoanOffering = {
            ...loanOffering,
            signature
        };

        return signedOffering;
    }

    public getLoanOfferingHash(loanOffering: LoanOffering): string {
        const valuesHash = Web3Utils.soliditySha3(
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
            { type: 'uint32', value: loanOffering.interestPeriod }
        );
        return Web3Utils.soliditySha3(
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
            valuesHash
        );
    }

    public setProvider(currentProvider) {
        this.currentProvider = currentProvider;
    }
}
