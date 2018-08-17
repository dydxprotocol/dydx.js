import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import Contracts from '../../lib/Contracts';

export default class LeveragedToken extends MarginToken {
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
    // TODO

    return {};
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
    // TODO

    return {};
  }

  public async close(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    payoutInHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: object,
  ): Promise<object> {
    // TODO

    return {};
  }

  public async closeWithETHPayout(
    positionId: string,
    closer: string,
    tokensToClose: BigNumber,
    ethIsHeldToken: boolean,
    exchangeWrapper: ExchangeWrapper,
    orderData: string,
    options: object,
  ): Promise<object> {
    // TODO

    return {};
  }
}
