import ExchangeWrapper from './ExchangeWrapper';
import Contracts from '../../lib/Contracts';

export default class OpenDirectlyExchangeWrapper extends ExchangeWrapper {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    super();
    this.contracts = contracts;
  }

  public getAddress() {
    return this.contracts.openDirectlyExchangeWrapper.address;
  }
}
