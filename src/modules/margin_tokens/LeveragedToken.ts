import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import MathHelpers from '../helpers/MathHelpers';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import Contracts from '../../lib/Contracts';
import { EVENTS } from '../../lib/Constants';

import {
  ContractCallOptions,
  Contract,
  SignedLoanOffering,
  Position,
} from '../../types';

export default class LeveragedToken extends MarginToken {
  private math: MathHelpers;

  constructor(
    margin: Margin,
    contracts: Contracts,
    math: MathHelpers,
  ) {
    super(margin, contracts);
    this.math = math;
  }

  public async createCappedLong(
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
    trustedLateClosers: string[],
    cap: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const positionId = this.margin.getPositionId(trader, nonce);
    const { address: tokenAddress }: Contract = await this.createCappedERC20LongToken(
      trader,
      positionId,
      [this.contracts.DutchAuctionCloser.address],
      [this.contracts.ERC20PositionWithdrawer.address],
      trustedLateClosers,
      cap,
      options,
    );
    const response: any = await this.margin.openWithoutCounterparty(
      trader,
      tokenAddress,
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
    response.tokenAddress = tokenAddress;
    return response;
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
    const response: any = await this.margin.openWithoutCounterparty(
      trader,
      this.contracts.erc20LongFactory.address,
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
    const getTokenAddressEvent = response.logs.find(
      log => (
        log.event === EVENTS.POSITION_TRANSFERRED
        && log.args.from === this.contracts.ERC20LongFactory.address
      ),
    );
    response.tokenAddress = getTokenAddressEvent.args.to;
    return response;
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
    const principalToAdd: BigNumber = await this.calculatePrincipal(positionId, tokensToMint);

    return this.margin.increasePosition(
      positionId,
      loanOffering,
      trader,
      principalToAdd,
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
    const principalToAdd: BigNumber = await this.calculatePrincipal(positionId, tokensToMint);

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
      principalToAdd,
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
    const principalToClose = await this.calculatePrincipal(positionId, tokensToClose);
    return this.margin.closePosition(
      positionId,
      closer,
      closer,
      principalToClose,
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
    const principalToClose = await this.calculatePrincipal(positionId, tokensToClose);
    return this.margin.closePosition(
      positionId,
      closer,
      this.contracts.wethPayoutRecipient.address,
      principalToClose,
      ethIsHeldToken,
      exchangeWrapper,
      orderData,
      options,
    );
  }

  private async calculatePrincipal(
    positionId: string,
    tokens: BigNumber,
  ): Promise<BigNumber> {
    const position: Position = await this.margin.getPosition(positionId);
    const collateral: BigNumber = await this.margin.getPositionBalance(positionId);
    return this.math.partialAmount(
      position.principal,
      collateral,
      tokens,
    );
  }

  private async createCappedERC20LongToken(
    initialTokenHolder: string,
    positionId: string,
    trustedRecipients: string[],
    trustedWithdrawers: string[],
    trustedLateClosers: string[],
    cap: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<Contract> {
    const ERC20CappedLong: any = this.contracts.ERC20CappedLong;
    options.from = initialTokenHolder;
    return this.contracts.createNewContract(
      ERC20CappedLong,
      { ...options },
      positionId,
      this.contracts.margin.address,
      initialTokenHolder,
      trustedRecipients,
      trustedWithdrawers,
      trustedLateClosers,
      cap,
    );
  }
}
