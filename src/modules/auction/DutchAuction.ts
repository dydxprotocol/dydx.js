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
    closer: string,
    closeAmount: BigNumber,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.margin.closePosition(
      positionId,
      closer,
      this.contracts.DutchAuctionCloser.address,
      closeAmount,
      true,
      exchangeWrapper,
      orderData,
      options,
    );
  }
}
