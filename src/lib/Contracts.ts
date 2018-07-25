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
  public MARGIN = contract(MarginContract);
  public PROXY = contract(ProxyContract);
  public ERC20SHORTCREATOR = contract(ERC20ShortCreatorContract);
  public ERC20LONGCREATOR = contract(ERC20LongCreatorContract);
  public SHAREDLONGCREATOR = contract(SharedLoanCreatorContract);
  public VAULT = contract(VaultContract);
  public TESTTOKEN = contract(TestTokenContract);

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
    setupContract(this.MARGIN, provider, networkId);
    setupContract(this.PROXY, provider, networkId);
    setupContract(this.ERC20ERC20SHORTCREATOR, provider, networkId);
    setupContract(this.ERC20ERC20LONGCREATOR, provider, networkId);
    setupContract(this.SHAREDLOANCREATOR, provider, networkId);
    setupContract(this.VAULT, provider, networkId);
    setupContract(this.TESTTOKEN, provider, networkId);

    const [
            margin,
            proxy,
            erc20ShortCreator,
            erc20LongCreator,
            sharedLoanCreator,
            vault,
        ] = await Promise.all([
          this.MARGIN.deployed(),
          this.PROXY.deployed(),
          this.ERC20SHORTCREATOR.deployed(),
          this.ERC20LONGCREATOR.deployed(),
          this.SHAREDLOANCREATOR.deployed(),
          this.VAULT.deployed(),
        ]);

    this.margin = margin;
    this.proxy = proxy;
    this.erc20ShortCreator = erc20ShortCreator;
    this.erc20LongCreator = erc20LongCreator;
    this.sharedLoanCreator = sharedLoanCreator;
    this.vault = vault;
  }
}
