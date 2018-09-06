import BigNumber from 'bignumber.js';
import Contracts from '../../lib/Contracts';
import Margin from '../Margin';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import { ContractCallOptions } from '../../types';

export default class DutchAuction {
  private contracts: Contracts;
  private margin: Margin;

  constructor(
    margin: Margin,
    contracts: Contracts,
  ) {
    this.margin = margin;
    this.contracts = contracts;
  }

  public async bid(
    positionId: string,
    bidder: string,
    closeAmount: BigNumber,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.margin.closePosition(
      positionId,
      bidder,
      this.contracts.DutchAuctionCloser.address,
      closeAmount,
      true,
      exchangeWrapper,
      orderData,
      options,
    );
  }

  public async bidThroughProxy(
    positionId: string,
    bidder: string,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    minCloseAmount: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.contracts.callContractFunction(
      this.contracts.auctionProxy.closePosition,
      { from: bidder },
      positionId,
      minCloseAmount,
      this.contracts.DutchAuctionCloser.address,
      exchangeWrapper,
      orderData,
    );
  }
}
