import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import Contracts from '../../lib/Contracts';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import { Position, SignedLoanOffering } from '../../types';
import { callContractFunction } from '../../lib/Helpers';

export default class ShortToken extends MarginToken {
  constructor(
    margin: Margin,
    contracts: Contracts,
  ) {
    super(margin, contracts);
  }

  public async mint(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    payInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: object = {},
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
    options: object = {},
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

    return callContractFunction(
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
}
