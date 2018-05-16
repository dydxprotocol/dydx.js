import { LoanOffering, SignedLoanOffering, Signature } from '../types';
import ethUtil from 'ethereumjs-util';
import { Contracts } from '../lib/Contracts';

export class LoanHelper {
    private web3;

    private contracts: Contracts;

    constructor(
        web3,
        contracts: Contracts
    ) {
        this.web3 = web3;
        this.contracts = contracts;
    }

    public async signLoanOffering(loanOffering: LoanOffering): Promise<SignedLoanOffering> {
        const hash: string = this.getLoanOfferingHash(loanOffering);

        const signatureString: string = await this.web3.eth.signAsync(
          hash, loanOffering.signer
        );

        const signature: Signature = ethUtil.fromRpcSig(signatureString);

        const signedOffering: SignedLoanOffering = {
            ...loanOffering,
            signature
        };

        return signedOffering;
    }

    public getLoanOfferingHash(loanOffering: LoanOffering): string {
        const valuesHash = this.web3.utils.soliditySha3(
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
        return this.web3.utils.soliditySha3(
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
}
