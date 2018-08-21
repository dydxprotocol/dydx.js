import {
  Margin as MarginContract,
  TokenProxy as TokenProxyContract,
  ERC20ShortFactory as ERC20ShortFactoryContract,
  ERC20LongFactory as ERC20LongFactoryContract,
  SharedLoanFactory as SharedLoanFactoryContract,
  TestToken as TestTokenContract,
  Vault as VaultContract,
  ZeroExExchangeWrapper as ZeroExExchangeWrapperContract,
  PayableMarginMinter as PayableMarginMinterContract,
  WethPayoutRecipient as WethPayoutRecipientContract,
  BucketLender as BucketLenderContract,
  BucketLenderFactory as BucketLenderFactoryContract,
  EthWrapperForBucketLender as EthWrapperForBucketLenderContract,
  ERC20 as ERC20Contract,
  WETH9 as WETH9Contract,
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';
import Web3 from 'web3';
import bluebird from 'bluebird';
import { Contract, Provider } from '../types';

export default class Contracts {
  public Margin: Contract = truffleContract(MarginContract);
  public TokenProxy: Contract = truffleContract(TokenProxyContract);
  public ERC20ShortFactory: Contract = truffleContract(ERC20ShortFactoryContract);
  public ERC20LongFactory: Contract = truffleContract(ERC20LongFactoryContract);
  public SharedLoanFactory: Contract = truffleContract(SharedLoanFactoryContract);
  public Vault: Contract = truffleContract(VaultContract);
  public TestToken: Contract = truffleContract(TestTokenContract);
  public ZeroExExchangeWrapper: Contract = truffleContract(ZeroExExchangeWrapperContract);
  public PayableMarginMinter: Contract = truffleContract(PayableMarginMinterContract);
  public WethPayoutRecipient: Contract = truffleContract(WethPayoutRecipientContract);
  public BucketLender: Contract = truffleContract(BucketLenderContract);
  public BucketLenderFactory: Contract = truffleContract(BucketLenderFactoryContract);
  public EthWrapperForBucketLender: Contract = truffleContract(EthWrapperForBucketLenderContract);
  public ERC20: Contract = truffleContract(ERC20Contract);
  public WETH9: Contract = truffleContract(WETH9Contract);

  public margin;
  public tokenProxy;
  public erc20ShortFactory;
  public erc20LongFactory;
  public sharedLoanFactory;
  public vault;
  public zeroExExchangeWrapper;
  public web3;
  public payableMarginMinter;
  public wethPayoutRecipient;
  public bucketLenderFactory;
  public ethWrapperForBucketLender;

  constructor() {
    this.web3 = new Web3('');
    bluebird.promisifyAll(this.web3.eth);
  }

  public async setProvider(
    provider: Provider,
    networkId: number,
  ): Promise<void> {
    setupContract(this.Margin, provider, networkId);
    setupContract(this.TokenProxy, provider, networkId);
    setupContract(this.ERC20ShortFactory, provider, networkId);
    setupContract(this.ERC20LongFactory, provider, networkId);
    setupContract(this.SharedLoanFactory, provider, networkId);
    setupContract(this.Vault, provider, networkId);
    setupContract(this.TestToken, provider, networkId);
    setupContract(this.ZeroExExchangeWrapper, provider, networkId);
    setupContract(this.PayableMarginMinter, provider, networkId);
    setupContract(this.WethPayoutRecipient, provider, networkId);
    setupContract(this.BucketLender, provider, networkId);
    setupContract(this.BucketLenderFactory, provider, networkId);
    setupContract(this.EthWrapperForBucketLender, provider, networkId);
    setupContract(this.ERC20, provider, networkId);
    setupContract(this.WETH9, provider, networkId);

    this.web3.setProvider(provider);

    const [
      margin,
      tokenProxy,
      erc20ShortFactory,
      erc20LongFactory,
      sharedLoanFactory,
      vault,
      zeroExExchangeWrapper,
      payableMarginMinter,
      wethPayoutRecipient,
      bucketLenderFactory,
      ethWrapperForBucketLender,
    ] = await Promise.all([
      this.Margin.deployed(),
      this.TokenProxy.deployed(),
      this.ERC20ShortFactory.deployed(),
      this.ERC20LongFactory.deployed(),
      this.SharedLoanFactory.deployed(),
      this.Vault.deployed(),
      this.ZeroExExchangeWrapper.deployed(),
      this.PayableMarginMinter.deployed(),
      this.WethPayoutRecipient.deployed(),
      this.BucketLenderFactory.deployed(),
      this.EthWrapperForBucketLender.deployed(),
    ]);

    this.margin = margin;
    this.tokenProxy = tokenProxy;
    this.erc20ShortFactory = erc20ShortFactory;
    this.erc20LongFactory = erc20LongFactory;
    this.sharedLoanFactory = sharedLoanFactory;
    this.vault = vault;
    this.zeroExExchangeWrapper = zeroExExchangeWrapper;
    this.payableMarginMinter = payableMarginMinter;
    this.wethPayoutRecipient = wethPayoutRecipient;
    this.bucketLenderFactory = bucketLenderFactory;
    this.ethWrapperForBucketLender = ethWrapperForBucketLender;
  }
}
