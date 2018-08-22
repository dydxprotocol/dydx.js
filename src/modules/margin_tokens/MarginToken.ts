import BigNumber from 'bignumber.js';
import Margin from '../Margin';
import Contracts from '../../lib/Contracts';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import { Position, SignedLoanOffering, ContractCallOptions } from '../../types';
import { ADDRESSES, BIG_NUMBERS } from '../../lib/Constants';

export default abstract class MarginToken {
  protected margin: Margin;
  protected contracts: Contracts;

  constructor(
    margin: Margin,
    contracts: Contracts,
  ) {
    this.margin = margin;
    this.contracts = contracts;
  }

  public abstract async create(
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
    options: ContractCallOptions,
  ): Promise<object>;

  public abstract async mint(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    payInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions,
  ): Promise<object>;

  public abstract async mintWithETH(
    positionId: string,
    trader: string,
    tokensToMint: BigNumber,
    ethToSend: BigNumber,
    ethIsHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions,
  ): Promise<object>;

  public abstract async close(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    payoutInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions,
  ): Promise<object>;

  public abstract async closeWithETHPayout(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    ethIsHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions,
  ): Promise<object>;

  protected prepareMintLoanOffering(position: Position): SignedLoanOffering {
    return {
      owedToken:              '', // Unused
      heldToken:              '', // Unused
      payer:                  position.lender,
      owner:                  '', // Unused
      taker:                  ADDRESSES.ZERO,
      positionOwner:          ADDRESSES.ZERO,
      feeRecipient:           ADDRESSES.ZERO,
      lenderFeeTokenAddress:  ADDRESSES.ZERO,
      takerFeeTokenAddress:   ADDRESSES.ZERO,
      maxAmount:              BIG_NUMBERS.ONES_255,
      minAmount:              BIG_NUMBERS.ZERO,
      minHeldToken:           BIG_NUMBERS.ZERO,
      lenderFee:              BIG_NUMBERS.ZERO,
      takerFee:               BIG_NUMBERS.ZERO,
      interestRate:           BIG_NUMBERS.ZERO, // Unused
      interestPeriod:         BIG_NUMBERS.ZERO,  // Unused
      expirationTimestamp:    BIG_NUMBERS.ONES_255,
      callTimeLimit:          BIG_NUMBERS.ONES_31,
      maxDuration:            BIG_NUMBERS.ONES_31,
      salt:                   BIG_NUMBERS.ZERO,
      signature:              '',
    };
  }
}
