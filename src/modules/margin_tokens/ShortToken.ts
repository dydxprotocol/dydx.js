import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import Contracts from '../../lib/Contracts';
import { EVENTS } from '../../lib/Constants';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import { SignedLoanOffering, ContractCallOptions, Contract } from '../../types';

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
    const response: any = await this.margin.openWithoutCounterparty(
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
    const getTokenAddressEvent = response.logs.find(
      log => (
        log.event === EVENTS.POSITION_TRANSFERRED
        && log.args.from === this.contracts.ERC20ShortFactory.address
      ),
    );
    response.tokenAddress = getTokenAddressEvent.args.to;
    return response;
  }

  public async createCappedShort(
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
    name: string,
    symbol: string,
    decimals: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const positionId = this.margin.getPositionId(trader, nonce);
    const { address: tokenAddress }: Contract  = await this.createCappedERC20ShortToken(
      trader,
      positionId,
      [this.contracts.DutchAuctionCloser.address],
      [this.contracts.ERC20PositionWithdrawerV2.address],
      trustedLateClosers,
      cap,
      name,
      symbol,
      decimals,
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

  public async mint(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    payInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
    positionLender?: string,
  ): Promise<object> {
    let lender: string = positionLender;
    if (!lender) {
      const position = await this.margin.getPosition(positionId);
      lender = position.lender;
    }
    const loanOffering: SignedLoanOffering = this.prepareMintLoanOffering(lender);

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
    positionLender?: string,
  ): Promise<object> {
    let lender: string = positionLender;
    if (!lender) {
      const position = await this.margin.getPosition(positionId);
      lender = position.lender;
    }
    const loanOffering: SignedLoanOffering = this.prepareMintLoanOffering(lender);

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

  private async createCappedERC20ShortToken(
    initialTokenHolder: string,
    positionId: string,
    trustedRecipients: string[],
    trustedWithdrawers: string[],
    trustedLateClosers: string[],
    cap: BigNumber,
    name: string,
    symbol: string,
    decimals: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<Contract> {
    const ERC20CappedShort: any = this.contracts.ERC20CappedShort;
    options.from = initialTokenHolder;
    return this.contracts.createNewContract(
      ERC20CappedShort,
      { ...options },
      positionId,
      this.contracts.margin.address,
      initialTokenHolder,
      trustedRecipients,
      trustedWithdrawers,
      trustedLateClosers,
      cap,
      name,
      symbol,
      decimals,
    );
  }
}
