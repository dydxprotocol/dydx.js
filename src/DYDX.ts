import LoanHelper from './modules/LoanHelper';
import ZeroExExchangeWrapper from './modules/exchange_wrappers/ZeroExExchangeWrapper';
import Margin from './modules/Margin';
import TokenHelper from './modules/TokenHelper';
import ShortToken from './modules/margin_tokens/ShortToken';
import LeveragedToken from './modules/margin_tokens/LeveragedToken';
import Contracts from './lib/Contracts';

export class DYDX {
  public margin: Margin;
  public loanOffering: LoanHelper;
  public zeroExExchangeWrapper: ZeroExExchangeWrapper;
  public token: TokenHelper;
  public contracts: Contracts;
  public shortToken: ShortToken;
  public leveragedToken: LeveragedToken;

  public currentProvider;
  public currentNetworkId;
  public initialized;

  constructor() {
    this.initialized = false;

    this.contracts = new Contracts();

    this.loanOffering = new LoanHelper(this.contracts);
    this.margin = new Margin(this.contracts);
    this.zeroExExchangeWrapper = new ZeroExExchangeWrapper(this.contracts);
    this.token = new TokenHelper(this.contracts);
    this.shortToken = new ShortToken(this.margin, this.contracts);
    this.leveragedToken = new LeveragedToken(this.margin, this.contracts);
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
