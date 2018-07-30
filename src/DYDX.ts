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
  public contracts: Contracts;

  public currentProvider;
  public currentNetworkId;
  public initialized;

  constructor() {
    this.initialized = false;

    this.contracts = new Contracts();

    this.loanOffering = new LoanHelper(this.contracts);
    this.margin = new Margin(this.contracts);
    this.zeroEx = new ZeroExHelper();
    this.token = new TokenHelper(this.contracts);
  }

  public async initialize(provider, networkId) {
    this.currentProvider = provider;
    this.currentNetworkId = networkId;
    this.initialized = true;

    await this.contracts.setProvider(provider, networkId);
    this.token.setProvider(provider, networkId);
    this.loanOffering.setProvider(provider);
  }
}
