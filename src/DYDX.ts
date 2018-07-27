import { LoanHelper } from './modules/LoanHelper';
import { ZeroExHelper } from './modules/ZeroExHelper';
import { Margin } from './modules/Margin';
import { TokenHelper } from './modules/TokenHelper';
import { Contracts } from './lib/Contracts';

export class DYDX {
  public margin: Margin;
  public loanOffering: LoanHelper;
  public zeroEx: ZeroExHelper;
  public token: TokenHelper;

  public currentProvider;
  public currentNetworkId;

  private contracts: Contracts;

  constructor(
    provider: any,
    networkId: number,
  ) {
    this.currentProvider = provider;
    this.currentNetworkId = networkId;

    this.contracts = new Contracts(provider, networkId);

    this.loanOffering = new LoanHelper(provider, this.contracts);
    this.margin = new Margin(this.contracts);
    this.zeroEx = new ZeroExHelper();
    this.token = new TokenHelper(provider, networkId, this.contracts);
  }

  public async setProvider(provider, networkId) {
    this.currentProvider = provider;
    this.currentNetworkId = networkId;

    await this.contracts.setProvider(provider, networkId);
    this.token.setProvider(provider, networkId);
    this.loanOffering.setProvider(provider);
  }
}
