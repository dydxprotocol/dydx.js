import LoanHelper from './modules/LoanHelper';
import ZeroExExchangeWrapper from './modules/exchange_wrappers/ZeroExExchangeWrapper';
import Margin from './modules/Margin';
import TokenHelper from './modules/TokenHelper';
import ShortToken from './modules/margin_tokens/ShortToken';
import LeveragedToken from './modules/margin_tokens/LeveragedToken';
import BucketLender from './modules/lending/BucketLender';
import MathHelpers from './modules/helpers/MathHelpers';
import Contracts from './lib/Contracts';
import { Provider } from './types';

export class DYDX {
  public margin: Margin;
  public loanOffering: LoanHelper;
  public zeroExExchangeWrapper: ZeroExExchangeWrapper;
  public token: TokenHelper;
  public contracts: Contracts;
  public shortToken: ShortToken;
  public leveragedToken: LeveragedToken;
  public bucketLender: BucketLender;
  public math: MathHelpers;

  public currentProvider: Provider;
  public currentNetworkId: number;
  public initialized: boolean;

  constructor() {
    this.initialized = false;

    this.contracts = new Contracts();

    this.loanOffering = new LoanHelper(this.contracts);
    this.margin = new Margin(this.contracts);
    this.zeroExExchangeWrapper = new ZeroExExchangeWrapper(this.contracts);
    this.token = new TokenHelper(this.contracts);
    this.shortToken = new ShortToken(this.margin, this.contracts);
    this.leveragedToken = new LeveragedToken(this.margin, this.contracts);
    this.bucketLender = new BucketLender(this.contracts);
    this.math = new MathHelpers();
  }

  public async initialize(
    provider: Provider,
    networkId: number,
  ) {
    this.currentProvider = provider;
    this.currentNetworkId = networkId;
    this.initialized = true;

    await this.contracts.setProvider(provider, networkId);
    this.loanOffering.setProvider(provider);
  }
}
