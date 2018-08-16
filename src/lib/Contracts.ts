import {
  Margin as MarginContract,
  TokenProxy as TokenProxyContract,
  ERC20ShortCreator as ERC20ShortCreatorContract,
  ERC20LongCreator as ERC20LongCreatorContract,
  SharedLoanCreator as SharedLoanCreatorContract,
  TestToken as TestTokenContract,
  Vault as VaultContract,
  ZeroExExchangeWrapper as ZeroExExchangeWrapperContract,
  PayableMarginMinter as PayableMarginMinterContract,
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';
import Web3 from 'web3';
import bluebird from 'bluebird';

export default class Contracts {
  public Margin = truffleContract(MarginContract);
  public TokenProxy = truffleContract(TokenProxyContract);
  public ERC20ShortCreator = truffleContract(ERC20ShortCreatorContract);
  public ERC20LongCreator = truffleContract(ERC20LongCreatorContract);
  public SharedLoanCreator = truffleContract(SharedLoanCreatorContract);
  public Vault = truffleContract(VaultContract);
  public TestToken = truffleContract(TestTokenContract);
  public ZeroExExchangeWrapper = truffleContract(ZeroExExchangeWrapperContract);
  public PayableMarginMinter = truffleContract(PayableMarginMinterContract);

  public margin;
  public tokenProxy;
  public erc20ShortCreator;
  public erc20LongCreator;
  public sharedLoanCreator;
  public vault;
  public zeroExExchangeWrapper;
  public web3;
  public payableMarginMinter;

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
    setupContract(this.ERC20ShortCreator, provider, networkId);
    setupContract(this.ERC20LongCreator, provider, networkId);
    setupContract(this.SharedLoanCreator, provider, networkId);
    setupContract(this.Vault, provider, networkId);
    setupContract(this.TestToken, provider, networkId);
    setupContract(this.ZeroExExchangeWrapper, provider, networkId);
    setupContract(this.PayableMarginMinter, provider, networkId);
    this.web3.setProvider(provider);
    this.web3.eth.defaultAccount = this.web3.eth.accounts[0];

    const [
      margin,
      tokenProxy,
      erc20ShortCreator,
      erc20LongCreator,
      sharedLoanCreator,
      vault,
      zeroExExchangeWrapper,
      payableMarginMinter,
    ] = await Promise.all([
      this.Margin.deployed(),
      this.TokenProxy.deployed(),
      this.ERC20ShortCreator.deployed(),
      this.ERC20LongCreator.deployed(),
      this.SharedLoanCreator.deployed(),
      this.Vault.deployed(),
      this.ZeroExExchangeWrapper.deployed(),
      this.PayableMarginMinter.deployed(),
    ]);

    this.margin = margin;
    this.tokenProxy = tokenProxy;
    this.erc20ShortCreator = erc20ShortCreator;
    this.erc20LongCreator = erc20LongCreator;
    this.sharedLoanCreator = sharedLoanCreator;
    this.vault = vault;
    this.zeroExExchangeWrapper = zeroExExchangeWrapper;
    this.payableMarginMinter = payableMarginMinter;
  }
}
