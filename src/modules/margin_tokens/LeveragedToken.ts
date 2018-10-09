import BigNumber from 'bignumber.js';
import MarginToken from './MarginToken';
import Margin from '../Margin';
import ExchangeWrapper from '../exchange_wrappers/ExchangeWrapper';
import Contracts from '../../lib/Contracts';
import { EVENTS } from '../../lib/Constants';
import { ContractCallOptions } from '../../types';

export default class LeveragedToken extends MarginToken {
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
    options: ContractCallOptions = {},
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
    options: ContractCallOptions = {},
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
    options: ContractCallOptions = {},
  ): Promise<object> {
    // TODO

    return {};
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
    // TODO
    return {};
  }
}
