import LoanHelper from './modules/LoanHelper';
import ZeroExV1ExchangeWrapper from './modules/exchange_wrappers/ZeroExV1ExchangeWrapper';
import ZeroExV2ExchangeWrapper from './modules/exchange_wrappers/ZeroExV2ExchangeWrapper';
import Margin from './modules/Margin';
import TokenHelper from './modules/TokenHelper';
import ShortToken from './modules/margin_tokens/ShortToken';
import LeveragedToken from './modules/margin_tokens/LeveragedToken';
import BucketLender from './modules/lending/BucketLender';
import MathHelpers from './modules/helpers/MathHelpers';
import DutchAuction from './modules/auction/DutchAuction';
import Interest from './modules/helpers/Interest';
import Contracts from './lib/Contracts';
import { Provider } from './types';

export class DYDX {
  public margin: Margin;
  public loanOffering: LoanHelper;
  public zeroExV1ExchangeWrapper: ZeroExV1ExchangeWrapper;
  public zeroExV2ExchangeWrapper: ZeroExV2ExchangeWrapper;
  public token: TokenHelper;
  public contracts: Contracts;
  public shortToken: ShortToken;
  public leveragedToken: LeveragedToken;
  public bucketLender: BucketLender;
  public math: MathHelpers;
  public auction: DutchAuction;
  public interest: Interest;

  public currentProvider: Provider;
  public currentNetworkId: number;
  public initialized: boolean;

  constructor() {
    this.initialized = false;

    this.contracts = new Contracts();
    this.math = new MathHelpers();
    this.interest = new Interest();

    this.loanOffering = new LoanHelper(this.contracts);
    this.margin = new Margin(this.contracts);
    this.zeroExV1ExchangeWrapper = new ZeroExV1ExchangeWrapper(this.contracts);
    this.zeroExV2ExchangeWrapper = new ZeroExV2ExchangeWrapper(this.contracts);
    this.token = new TokenHelper(this.contracts);
    this.bucketLender = new BucketLender(this.contracts);

    this.shortToken = new ShortToken(this.margin, this.contracts);
    this.leveragedToken = new LeveragedToken(this.margin, this.contracts);
    this.auction = new DutchAuction(this.margin, this.contracts);
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
