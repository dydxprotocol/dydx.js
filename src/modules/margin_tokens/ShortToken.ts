import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import Contracts from '../../lib/Contracts';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import { Position, SignedLoanOffering, ContractCallOptions } from '../../types';

export default class ShortToken extends MarginToken {
  constructor(
    margin: Margin,
    contracts: Contracts,
  ) {
    super(margin, contracts);
  }

  public async create(
    trader: string,
    lenderContractAddress: string,
    owedToken: string,
    heldToken: string,
    nonce: BigNumber,
    deposit: BigNumber,
    principal: BigNumber,
    callTimeLimit: BigNumber,
    maxDuration: BigNumber,
    interestRate: BigNumber,
    interestPeriod: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.margin.openWithoutCounterparty(
      trader,
      this.contracts.erc20ShortFactory.address,
      lenderContractAddress,
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

  public async mint(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    payInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const position: Position = await this.margin.getPosition(positionId);
    const loanOffering: SignedLoanOffering = this.prepareMintLoanOffering(position);

    return this.margin.increasePosition(
      positionId,
      loanOffering,
      trader,
      tokensToMint,
      payInHeldToken,
      exchangeWrapper,
      orderData,
      options,
    );
  }

  public async mintWithETH(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    ethToSend: BigNumber,
    ethIsHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const position: Position = await this.margin.getPosition(positionId);
    const loanOffering: SignedLoanOffering = this.prepareMintLoanOffering(position);

    const addresses = [
      loanOffering.payer,
      loanOffering.taker,
      loanOffering.positionOwner,
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
      tokensToMint,
    ];

    const values32 = [
      loanOffering.callTimeLimit,
      loanOffering.maxDuration,
    ];

    return this.contracts.callContractFunction(
      this.contracts.payableMarginMinter.mintMarginTokens,
      { ...options, from: trader, value: ethToSend },
      positionId,
      addresses,
      values256,
      values32,
      ethIsHeldToken,
      loanOffering.signature,
      orderData,
    );
  }

  public async close(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    payoutInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.margin.closePosition(
      positionId,
      closer,
      closer,
      tokensToClose,
      payoutInHeldToken,
      exchangeWrapper,
      orderData,
      options,
    );
  }

  public async closeWithETHPayout(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    ethIsHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.margin.closePosition(
      positionId,
      closer,
      this.contracts.wethPayoutRecipient.address,
      tokensToClose,
      ethIsHeldToken,
      exchangeWrapper,
      orderData,
      options,
    );
  }
}
