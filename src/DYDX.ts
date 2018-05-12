import { LoanOffering, SignedLoanOffering, Signature } from './types';
import { ExchangeWrapper } from './ExchangeWrapper';
import Web3 from 'web3';
import bluebird from 'bluebird';
import ethUtil from 'ethereumjs-util';
import { BigNumber } from 'bignumber.js';
import { Margin } from '@dydxprotocol/protocol';

export class DYDX {
    public margin;

    private web3;

    constructor(
        provider,
        {
            marginAddress = undefined
        } = {}
    ) {
        this.web3 = new Web3(provider);
        bluebird.promisifyAll(this.web3.eth);

        this.margin = new this.web3.eth.Contract(Margin, marginAddress);
    }

    public async signLoanOfferingAsync(loanOffering: LoanOffering): Promise<SignedLoanOffering> {
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
            loanOffering.rates.maxAmount,
            loanOffering.rates.minAmount,
            loanOffering.rates.minHeldToken,
            loanOffering.rates.lenderFee,
            loanOffering.rates.takerFee,
            loanOffering.expirationTimestamp,
            loanOffering.salt,
            { type: 'uint32', value: loanOffering.callTimeLimit },
            { type: 'uint32', value: loanOffering.maxDuration },
            { type: 'uint32', value: loanOffering.rates.interestRate },
            { type: 'uint32', value: loanOffering.rates.interestPeriod }
        );
        return this.web3.utils.soliditySha3(
            this.margin.address,
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

    public async callOpenPosition(
        loanOffering: SignedLoanOffering,
        owner: string,
        orderData: string,
        principal: BigNumber,
        depositAmount: BigNumber,
        depositInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        trader: string
    ) {
        const addresses = [
            owner,
            loanOffering.owedToken,
            loanOffering.heldToken,
            loanOffering.payer,
            loanOffering.signer,
            loanOffering.owner,
            loanOffering.taker,
            loanOffering.feeRecipient,
            loanOffering.lenderFeeTokenAddress,
            loanOffering.takerFeeTokenAddress,
            exchangeWrapper.getAddress()
        ];

        const values256 = [
            loanOffering.rates.maxAmount,
            loanOffering.rates.minAmount,
            loanOffering.rates.minHeldToken,
            loanOffering.rates.lenderFee,
            loanOffering.rates.takerFee,
            loanOffering.expirationTimestamp,
            loanOffering.salt,
            principal,
            depositAmount
        ];

        const values32 = [
            loanOffering.callTimeLimit,
            loanOffering.maxDuration,
            loanOffering.rates.interestRate,
            loanOffering.rates.interestPeriod
        ];

        const sigV = loanOffering.signature.v;

        const sigRS = [
            loanOffering.signature.r,
            loanOffering.signature.s,
        ];

        let response = await this.margin.openPosition(
            addresses,
            values256,
            values32,
            sigV,
            sigRS,
            depositInHeldToken,
            orderData,
            { from: trader }
        );

        return response;
    }
}
