import { LoanOffering, SignedLoanOffering, Position } from '../types';
import { ExchangeWrapper } from './ExchangeWrapper';
import  BigNumber  from 'bignumber.js';
import { Contracts } from '../lib/Contracts';
import web3Utils from 'web3-utils';
import { callContractFunction } from '../lib/Helpers';

export class Margin {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
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
    options: object = {},
  ): Promise<object> {
    const positionId = web3Utils.soliditySha3(
      trader,
      nonce,
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
      exchangeWrapper.getAddress(),
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
      nonce,
    ];

    const values32 = [
      loanOffering.callTimeLimit,
      loanOffering.maxDuration,
      loanOffering.interestRate.times(new BigNumber(10).pow(6)).floor(),
      loanOffering.interestPeriod,
    ];

    const response = await callContractFunction(
      this.contracts.margin.openPosition,
      { ...options, from: trader },
      addresses,
      values256,
      values32,
      loanOffering.signature,
      depositInHeldToken,
      orderData,
    );

    response.id = positionId;

    return response;
  }

  public async openWithoutCounterparty(
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
    options: object = {},
  ): Promise<object> {

    const positionId = web3Utils.soliditySha3(
      trader,
      nonce,
    );

    const response = await callContractFunction(
      this.contracts.margin.openWithoutCounterparty,
      { ...options, from: trader },
      [
        positionOwner,
        owedToken,
        heldToken,
        loanOwner,
      ],
      [
        principal,
        deposit,
        nonce,
      ],
      [
        callTimeLimit,
        maxDuration,
        interestRate.times(new BigNumber(10).pow(6)).floor(),
        interestPeriod,
      ],
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
    options: object = {},
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
      options,
    );
  }

  public async createShortTokenWithoutCounterparty(
    trader: string,
    owedToken: string,
    heldToken: string,
    nonce: BigNumber,
    deposit: BigNumber,
    principal: BigNumber,
    callTimeLimit: BigNumber,
    maxDuration: BigNumber,
    interestRate: BigNumber,
    interestPeriod: BigNumber,
    options: object = {},
  ): Promise<object> {
    return this.openWithoutCounterparty(
      trader,
      this.contracts.erc20ShortCreator.address,
      this.contracts.sharedLoanCreator.address,
      owedToken,
      heldToken,
      nonce,
      deposit,
      principal,
      callTimeLimit,
      maxDuration,
      interestRate,
      interestPeriod,
      options,
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
    options: object = {},
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
      options,
    );
  }

  public async createLeveragedLongTokenWithoutCounterparty(
    trader: string,
    owedToken: string,
    heldToken: string,
    nonce: BigNumber,
    deposit: BigNumber,
    principal: BigNumber,
    callTimeLimit: BigNumber,
    maxDuration: BigNumber,
    interestRate: BigNumber,
    interestPeriod: BigNumber,
    options: object = {},
  ): Promise<object> {
    return this.openWithoutCounterparty(
      trader,
      this.contracts.erc20LongCreator.address,
      this.contracts.sharedLoanCreator.address,
      owedToken,
      heldToken,
      nonce,
      deposit,
      principal,
      callTimeLimit,
      maxDuration,
      interestRate,
      interestPeriod,
      options,
    );
  }

  public async increaseWithoutCounterparty(
    positionId: string,
    principalToAdd: BigNumber,
    sender: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.increaseWithoutCounterparty,
      { ...options, from: sender },
      positionId,
      principalToAdd,
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
    options: object = {},
  ): Promise<object> {
    const addresses = [
      loanOffering.payer,
      loanOffering.signer,
      loanOffering.taker,
      loanOffering.feeRecipient,
      loanOffering.lenderFeeTokenAddress,
      loanOffering.takerFeeTokenAddress,
      exchangeWrapper.getAddress(),
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
    ];

    const values32 = [
      loanOffering.callTimeLimit,
      loanOffering.maxDuration,
    ];

    return callContractFunction(
      this.contracts.margin.increasePosition,
      { ...options, from: trader },
      positionId,
      addresses,
      values256,
      values32,
      depositInHeldToken,
      loanOffering.signature,
      orderData,
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
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.closePosition,
      { ...options, from: closer },
      positionId,
      closeAmount,
      payoutRecipient,
      exchangeWrapper.getAddress(),
      payoutInHeldToken,
      orderData,
    );
  }

  public async closePositionDirectly(
    positionId: string,
    closer: string,
    payoutRecipient: string,
    closeAmount: BigNumber,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.closePositionDirectly,
      { ...options, from: closer },
      positionId,
      closeAmount,
      payoutRecipient,
    );
  }

  public async closePositionWithoutCounterparty(
    positionId: string,
    closer: string,
    payoutRecipient: string,
    closeAmount: BigNumber,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.closeWithoutCounterparty,
      { ...options, from: closer },
      positionId,
      closeAmount,
      payoutRecipient,
    );
  }

  public async cancelLoanOffer(
    loanOffering: LoanOffering,
    cancelAmount: BigNumber,
    from: string,
    options: object = {},
  ): Promise<object> {
    const { addresses, values256, values32 } = this.formatLoanOffering(loanOffering);

    return callContractFunction(
      this.contracts.margin.cancelLoanOffering,
      { ...options, from },
      addresses,
      values256,
      values32,
      cancelAmount,
    );
  }

  public async marginCall(
    positionId: string,
    requiredDeposit: BigNumber,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.marginCall,
      { ...options, from },
      positionId,
      requiredDeposit,
    );
  }

  public async cancelMarginCall(
    positionId: string,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.cancelMarginCall,
      { ...options, from },
      positionId,
    );
  }

  public async forceRecoverCollateral(
    positionId: string,
    collateralRecipient: string,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.forceRecoverCollateral,
      { ...options, from },
      positionId,
      collateralRecipient,
    );
  }

  public async depositCollateral(
    positionId: string,
    depositAmount: BigNumber,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.forceRecoverCollateral,
      { ...options, from },
      positionId,
      depositAmount,
    );
  }

  public async transferLoan(
    positionId: string,
    to: string,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.transferLoan,
      { ...options, from },
      positionId,
      to,
    );
  }

  public async transferPosition(
    positionId: string,
    to: string,
    from: string,
    options: object = {},
  ): Promise<object> {
    return callContractFunction(
      this.contracts.margin.transferPosition,
      { ...options, from },
      positionId,
      to,
    );
  }

  // ============ Public Constant Contract Functions ============

  public async getPosition(
    positionId: string,
  ): Promise<Position> {
    const [
      [
        owedToken,
        heldToken,
        lender,
        owner,
      ],
      [
        principal,
        requiredDeposit,
      ],
      [
        callTimeLimit,
        startTimestamp,
        callTimestamp,
        maxDuration,
        interestRate,
        interestPeriod,
      ],
    ]: [string[], BigNumber[], BigNumber[]] = await this.contracts.margin.getPosition.call(
      positionId,
    );

    const adjustedInterestRate = interestRate.div(new BigNumber(10).pow(6));

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
      interestPeriod,
      interestRate: adjustedInterestRate,
    };
  }

  public async containsPosition(
    positionId: string,
  ): Promise<boolean> {
    return this.contracts.margin.containsPosition.call(positionId);
  }

  public async isPositionCalled(
    positionId: string,
  ): Promise<boolean> {
    return this.contracts.margin.isPositionCalled.call(positionId);
  }

  public async isPositionClosed(
    positionId: string,
  ): Promise<boolean> {
    return this.contracts.margin.isPositionClosed.call(positionId);
  }

  public async getTotalOwedTokenRepaidToLender(
    positionId: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getTotalOwedTokenRepaidToLender.call(positionId);
  }

  public async getPositionBalance(
    positionId: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getPositionBalance.call(positionId);
  }

  public async getTimeUntilInterestIncrease(
    positionId: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getTimeUntilInterestIncrease.call(positionId);
  }

  public async getPositionOwedAmount(
    positionId: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getPositionOwedAmount.call(positionId);
  }

  public async getPositionOwedAmountAtTime(
    positionId: string,
    principalToClose: BigNumber,
    timestampInSeconds: BigNumber,
  ): Promise<BigNumber> {
    return this.contracts.margin.getPositionOwedAmountAtTime.call(
      positionId,
      principalToClose,
      timestampInSeconds,
    );
  }

  public async getLenderAmountForIncreasePositionAtTime(
    positionId: string,
    principalToAdd: BigNumber,
    timestampInSeconds: BigNumber,
  ): Promise<BigNumber> {
    return this.contracts.margin.getLenderAmountForIncreasePositionAtTime.call(
      positionId,
      principalToAdd,
      timestampInSeconds,
    );
  }

  public async getLoanUnavailableAmount(
    loanHash: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getLoanUnavailableAmount.call(loanHash);
  }

  public async getLoanFilledAmount(
    loanHash: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getLoanFilledAmount.call(loanHash);
  }

  public async getLoanCanceledAmount(
    loanHash: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getLoanCanceledAmount.call(loanHash);
  }

  public async getLoanNumber(
    loanHash: string,
  ): Promise<BigNumber> {
    return this.contracts.margin.getLoanNumber.call(loanHash);
  }

  public async isLoanApproved(
    loanHash: string,
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
      loanOffering.interestPeriod,
    ];

    return { addresses, values256, values32 };
  }
}

interface FormattedLoanOffering {
  addresses: string[];
  values256: BigNumber[];
  values32: BigNumber[];
}
