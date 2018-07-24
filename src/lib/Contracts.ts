import {
    Margin as MarginContract,
    Proxy as ProxyContract,
    ERC20ShortCreator as ERC20ShortCreatorContract,
    ERC20LongCreator as ERC20LongCreatorContract,
    SharedLoanCreator as SharedLoanCreatorContract,
    TestToken as TestTokenContract,
} from '@dydxprotocol/protocol';
import contract from 'truffle-contract';
import { setupContract } from './Helpers';
import { Vault as VaultContract } from '@dydxprotocol/protocol';

export class Contracts {
    public Margin = contract(MarginContract);
    public Proxy = contract(ProxyContract);
    public ERC20ShortCreator = contract(ERC20ShortCreatorContract);
    public ERC20LongCreator = contract(ERC20LongCreatorContract);
    public SharedLoanCreator = contract(SharedLoanCreatorContract);
    public Vault = contract(VaultContract);
    public TestToken = contract(TestTokenContract);

    public margin;
    public proxy;
    public erc20ShortCreator;
    public erc20LongCreator;
    public sharedLoanCreator;
    public vault;

    constructor(
        provider: any,
        networkId: number
    ) {
        this.connectContracts(provider, networkId).catch( e => console.error(e) );
    }

    public async setProvider(
        provider: any,
        networkId: number
    ): Promise<any> {
        return this.connectContracts(provider, networkId);
    }

    private async connectContracts(
        provider: any,
        networkId: number
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
            vault
        ] = await Promise.all([
            this.Margin.deployed(),
            this.Proxy.deployed(),
            this.ERC20ShortCreator.deployed(),
            this.ERC20LongCreator.deployed(),
            this.SharedLoanCreator.deployed(),
            this.Vault.deployed()
        ]);

        this.margin = margin;
        this.proxy = proxy;
        this.erc20ShortCreator = erc20ShortCreator;
        this.erc20LongCreator = erc20LongCreator;
        this.sharedLoanCreator = sharedLoanCreator;
        this.vault = vault;
    }
}
