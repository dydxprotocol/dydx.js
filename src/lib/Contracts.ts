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
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';
import Web3 from 'web3';
import bluebird from 'bluebird';

export default class Contracts {
  public Margin = truffleContract(MarginContract);
  public TokenProxy = truffleContract(TokenProxyContract);
  public ERC20ShortFactory = truffleContract(ERC20ShortFactoryContract);
  public ERC20LongFactory = truffleContract(ERC20LongFactoryContract);
  public SharedLoanFactory = truffleContract(SharedLoanFactoryContract);
  public Vault = truffleContract(VaultContract);
  public TestToken = truffleContract(TestTokenContract);
  public ZeroExExchangeWrapper = truffleContract(ZeroExExchangeWrapperContract);
  public PayableMarginMinter = truffleContract(PayableMarginMinterContract);
  public WethPayoutRecipient = truffleContract(WethPayoutRecipientContract);

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

  constructor() {
    this.web3 = new Web3('');
    bluebird.promisifyAll(this.web3.eth);
  }

  public async setProvider(
    provider: any,
    networkId: number,
  ): Promise<any> {
    return this.connectContracts(provider, networkId);
  }

  private async connectContracts(
    provider: any,
    networkId: number,
  ) {
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
  }
}
