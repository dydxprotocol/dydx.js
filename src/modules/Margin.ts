import { LoanOffering, SignedLoanOffering, Position } from '../types';
import { ExchangeWrapper } from './ExchangeWrapper';
import bluebird from 'bluebird';
import ethUtil from 'ethereumjs-util';
import { BigNumber } from 'bignumber.js';
import { Margin as MarginContract } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';
import { Contracts } from '../lib/Contracts';
import Web3Utils from 'web3-utils';

export class Margin {
    private contracts: Contracts;

    constructor(
        contracts: Contracts
    ) {
        this.contracts = contracts;
    }

    // ============ Public State Changing Contract Functions ============

    public async openPosition(
        loanOffering: SignedLoanOffering,
        trader: string,
        owner: string,
        principal: BigNumber,
        depositAmount: BigNumber,
        nonce: BigNumber,
        depositInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        orderData: string,
        options: object = {}
    ): Promise<object> {
        const positionId = Web3Utils.soliditySha3(
            trader,
            nonce
        );

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
            loanOffering.maxAmount,
            loanOffering.minAmount,
            loanOffering.minHeldToken,
            loanOffering.lenderFee,
            loanOffering.takerFee,
            loanOffering.expirationTimestamp,
            loanOffering.salt,
            principal,
            depositAmount,
            nonce
        ];

        const values32 = [
            loanOffering.callTimeLimit,
            loanOffering.maxDuration,
            loanOffering.interestRate,
            loanOffering.interestPeriod
        ];

        const sigV = loanOffering.signature.v;

        const sigRS = [
            loanOffering.signature.r,
            loanOffering.signature.s,
        ];

        const response = this.contracts.margin.openPosition(
            addresses,
            values256,
            values32,
            sigV,
            sigRS,
            depositInHeldToken,
            orderData,
            {...options, from: trader }
        );

        response.id = positionId;

        return response;
    }

    public async callOpenWithoutCounterparty(
        trader: string,
        positionOwner: string,
        loanOwner: string,
        owedToken: string,
        heldToken: string,
        nonce: BigNumber,
        deposit: BigNumber,
        principal: BigNumber,
        callTimeLimit: BigNumber,
        maxDuration: BigNumber,
        interestRate: BigNumber,
        interestPeriod: BigNumber,
        options: object = {}
    ): Promise<object> {
        const positionId = Web3Utils.soliditySha3(
            trader,
            nonce
        );

        const response = await this.contracts.margin.openWithoutCounterparty(
            [
                positionOwner,
                owedToken,
                heldToken,
                loanOwner
            ],
            [
                principal,
                deposit,
                nonce
            ],
            [
                callTimeLimit,
                maxDuration,
                interestRate,
                interestPeriod
            ],
            { from: trader }
        );

        response.id = positionId;

        return response;
    }

    public async createShortToken(
        loanOffering: SignedLoanOffering,
        trader: string,
        principal: BigNumber,
        depositAmount: BigNumber,
        nonce: BigNumber,
        depositInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        orderData: string,
        options: object = {}
    ): Promise<object> {
        return this.openPosition(
            loanOffering,
            trader,
            this.contracts.erc20ShortCreator.address,
            principal,
            depositAmount,
            nonce,
            depositInHeldToken,
            exchangeWrapper,
            orderData,
            options
        );
    }

    public async createLeveragedLongToken(
        loanOffering: SignedLoanOffering,
        trader: string,
        principal: BigNumber,
        depositAmount: BigNumber,
        nonce: BigNumber,
        depositInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        orderData: string,
        options: object = {}
    ): Promise<object> {
        return this.openPosition(
            loanOffering,
            trader,
            this.contracts.erc20LongCreator.address,
            principal,
            depositAmount,
            nonce,
            depositInHeldToken,
            exchangeWrapper,
            orderData,
            options
        );
    }

    public async increasePosition(
        positionId: string,
        loanOffering: SignedLoanOffering,
        trader: string,
        principal: BigNumber,
        depositInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        orderData: string,
        options: object = {}
    ): Promise<object> {
        const addresses = [
            loanOffering.payer,
            loanOffering.signer,
            loanOffering.taker,
            loanOffering.feeRecipient,
            loanOffering.lenderFeeTokenAddress,
            loanOffering.takerFeeTokenAddress,
            exchangeWrapper.getAddress()
        ];

        const values256 = [
            loanOffering.maxAmount,
            loanOffering.minAmount,
            loanOffering.minHeldToken,
            loanOffering.lenderFee,
            loanOffering.takerFee,
            loanOffering.expirationTimestamp,
            loanOffering.salt,
            principal
        ];

        const values32 = [
            loanOffering.callTimeLimit,
            loanOffering.maxDuration
        ];

        const sigV = loanOffering.signature.v;

        const sigRS = [
            loanOffering.signature.r,
            loanOffering.signature.s,
        ];

        return this.contracts.margin.increasePosition(
            positionId,
            addresses,
            values256,
            values32,
            sigV,
            sigRS,
            depositInHeldToken,
            orderData,
            {...options, from: trader }
        );
    }

    public async closePosition(
        positionId: string,
        closer: string,
        payoutRecipient: string,
        closeAmount: BigNumber,
        payoutInHeldToken: boolean,
        exchangeWrapper: ExchangeWrapper,
        orderData: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.closePosition(
            positionId,
            closeAmount,
            payoutRecipient,
            exchangeWrapper.getAddress(),
            payoutInHeldToken,
            orderData,
            {...options, from: closer }
        );
    }

    public async closePositionDirectly(
        positionId: string,
        closer: string,
        payoutRecipient: string,
        closeAmount: BigNumber,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.closePositionDirectly(
            positionId,
            closeAmount,
            payoutRecipient,
            {...options, from: closer }
        );
    }

    public async closePositionWithoutCounterparty(
        positionId: string,
        closer: string,
        payoutRecipient: string,
        closeAmount: BigNumber,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.closeWithoutCounterparty(
            positionId,
            closeAmount,
            payoutRecipient,
            {...options, from: closer }
        );
    }

    public async cancelLoanOffer(
        loanOffering: LoanOffering,
        cancelAmount: BigNumber,
        from: string,
        options: object = {}
    ): Promise<object> {
        const { addresses, values256, values32 } = this.formatLoanOffering(loanOffering);

        return this.contracts.margin.cancelLoanOffering(
            addresses,
            values256,
            values32,
            cancelAmount,
            {...options, from }
        );
    }

    public async approveLoanOffering(
        loanOffering: LoanOffering,
        from: string,
        options: object = {}
    ): Promise<object> {
        const { addresses, values256, values32 } = this.formatLoanOffering(loanOffering);

        return this.contracts.margin.approveLoanOffering(
            addresses,
            values256,
            values32,
            {...options, from }
        );
    }

    public async marginCall(
        positionId: string,
        requiredDeposit: BigNumber,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.marginCall(
            positionId,
            requiredDeposit,
            {...options, from }
        );
    }

    public async cancelMarginCall(
        positionId: string,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.cancelMarginCall(
            positionId,
            {...options, from }
        );
    }

    public async forceRecoverCollateral(
        positionId: string,
        collateralRecipient: string,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.forceRecoverCollateral(
            positionId,
            collateralRecipient,
            {...options, from }
        );
    }

    public async depositCollateral(
        positionId: string,
        depositAmount: BigNumber,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.forceRecoverCollateral(
            positionId,
            depositAmount,
            {...options, from }
        );
    }

    public async transferLoan(
        positionId: string,
        to: string,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.transferLoan(
            positionId,
            to,
            {...options, from }
        );
    }

    public async transferPosition(
        positionId: string,
        to: string,
        from: string,
        options: object = {}
    ): Promise<object> {
        return this.contracts.margin.transferPosition(
            positionId,
            to,
            {...options, from }
        );
    }

    // ============ Public Constant Contract Functions ============

    public async getPosition(
        positionId: string
    ): Promise<Position> {
        const [
            [
                owedToken,
                heldToken,
                lender,
                owner
            ],
            [
                principal,
                requiredDeposit
            ],
            [
                callTimeLimit,
                startTimestamp,
                callTimestamp,
                maxDuration,
                interestRate,
                interestPeriod
            ]
        ]: [string[], BigNumber[], BigNumber[]] = await this.contracts.margin.getPosition.call(
            positionId
        );

        return {
            owedToken,
            heldToken,
            lender,
            owner,
            principal,
            requiredDeposit,
            callTimeLimit,
            startTimestamp,
            callTimestamp,
            maxDuration,
            interestRate,
            interestPeriod
        };
    }

    public async containsPosition(
        positionId: string
    ): Promise<boolean> {
        return this.contracts.margin.containsPosition.call(positionId);
    }

    public async isPositionCalled(
        positionId: string
    ): Promise<boolean> {
        return this.contracts.margin.isPositionCalled.call(positionId);
    }

    public async isPositionClosed(
        positionId: string
    ): Promise<boolean> {
        return this.contracts.margin.isPositionClosed.call(positionId);
    }

    public async getTotalOwedTokenRepaidToLender(
        positionId: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getTotalOwedTokenRepaidToLender.call(positionId);
    }

    public async getPositionBalance(
        positionId: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getPositionBalance.call(positionId);
    }

    public async getTimeUntilInterestIncrease(
        positionId: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getTimeUntilInterestIncrease.call(positionId);
    }

    public async getPositionOwedAmount(
        positionId: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getPositionOwedAmount.call(positionId);
    }

    public async getPositionOwedAmountAtTime(
        positionId: string,
        principalToClose: BigNumber,
        timestampInSeconds: BigNumber
    ): Promise<BigNumber> {
        return this.contracts.margin.getPositionOwedAmountAtTime.call(
            positionId,
            principalToClose,
            timestampInSeconds
        );
    }

    public async getLenderAmountForIncreasePositionAtTime(
        positionId: string,
        principalToAdd: BigNumber,
        timestampInSeconds: BigNumber
    ): Promise<BigNumber> {
        return this.contracts.margin.getLenderAmountForIncreasePositionAtTime.call(
            positionId,
            principalToAdd,
            timestampInSeconds
        );
    }

    public async getLoanUnavailableAmount(
        loanHash: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getLoanUnavailableAmount.call(loanHash);
    }

    public async getLoanFilledAmount(
        loanHash: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getLoanFilledAmount.call(loanHash);
    }

    public async getLoanCanceledAmount(
        loanHash: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getLoanCanceledAmount.call(loanHash);
    }

    public async getLoanNumber(
        loanHash: string
    ): Promise<BigNumber> {
        return this.contracts.margin.getLoanNumber.call(loanHash);
    }

    public async isLoanApproved(
        loanHash: string
    ): Promise<boolean> {
        return this.contracts.margin.isLoanApproved.call(loanHash);
    }

    // ============ Public Utility Functions ============

    public getAddress(): string {
        return this.contracts.margin.address;
    }

    // ============ Private Functions ============

    private formatLoanOffering(loanOffering: LoanOffering): FormattedLoanOffering {
        const addresses = [
            loanOffering.owedToken,
            loanOffering.heldToken,
            loanOffering.payer,
            loanOffering.signer,
            loanOffering.owner,
            loanOffering.taker,
            loanOffering.feeRecipient,
            loanOffering.lenderFeeTokenAddress,
            loanOffering.takerFeeTokenAddress,
        ];

        const values256 = [
            loanOffering.maxAmount,
            loanOffering.minAmount,
            loanOffering.minHeldToken,
            loanOffering.lenderFee,
            loanOffering.takerFee,
            loanOffering.expirationTimestamp,
            loanOffering.salt,
        ];

        const values32 = [
            loanOffering.callTimeLimit,
            loanOffering.maxDuration,
            loanOffering.interestRate,
            loanOffering.interestPeriod
        ];

        return { addresses, values256, values32 };
    }
}

interface FormattedLoanOffering {
    addresses: string[];
    values256: BigNumber[];
    values32: BigNumber[];
}
