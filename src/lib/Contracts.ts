import {
    Margin as MarginContract,
    Proxy as ProxyContract,
    ERC20ShortCreator as ERC20ShortCreatorContract,
    ERC20LongCreator as ERC20LongCreatorContract,
    SharedLoanCreator as SharedLoanCreatorContract,
    TestToken as TestTokenContract,
    Vault as VaultContract,
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';

export class Contracts {
  public Margin = truffleContract(MarginContract);
  public Proxy = truffleContract(ProxyContract);
  public ERC20ShortCreator = truffleContract(ERC20ShortCreatorContract);
  public ERC20LongCreator = truffleContract(ERC20LongCreatorContract);
  public SharedLoanCreator = truffleContract(SharedLoanCreatorContract);
  public Vault = truffleContract(VaultContract);
  public TestToken = truffleContract(TestTokenContract);

  public margin;
  public proxy;
  public erc20ShortCreator;
  public erc20LongCreator;
  public sharedLoanCreator;
  public vault;

  constructor(
    provider: any,
    networkId: number,
  ) {
    this.connectContracts(provider, networkId).catch(e => console.error(e));
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
    setupContract(this.Proxy, provider, networkId);
    setupContract(this.ERC20ShortCreator, provider, networkId);
    setupContract(this.ERC20LongCreator, provider, networkId);
    setupContract(this.SharedLoanCreator, provider, networkId);
    setupContract(this.Vault, provider, networkId);
    setupContract(this.TestToken, provider, networkId);

    const [
      margin,
      proxy,
      erc20ShortCreator,
      erc20LongCreator,
      sharedLoanCreator,
      vault,
    ] = await Promise.all([
      this.Margin.deployed(),
      this.Proxy.deployed(),
      this.ERC20ShortCreator.deployed(),
      this.ERC20LongCreator.deployed(),
      this.SharedLoanCreator.deployed(),
      this.Vault.deployed(),
    ]);

    this.margin = margin;
    this.proxy = proxy;
    this.erc20ShortCreator = erc20ShortCreator;
    this.erc20LongCreator = erc20LongCreator;
    this.sharedLoanCreator = sharedLoanCreator;
    this.vault = vault;
  }
}
