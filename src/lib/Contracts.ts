import {
import contract from 'truffle-contract';
import { setupContract } from './Helpers';

import { Vault as VaultContract } from '@dydxprotocol/protocol';

const Margin = contract(MarginContract);
const Proxy = contract(ProxyContract);
const ERC20ShortCreator = contract(ERC20ShortCreatorContract);
const ERC20LongCreator = contract(ERC20LongCreatorContract);
const SharedLoanCreator = contract(SharedLoanCreatorContract);
const Vault = contract(VaultContract);

export class Contracts {
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
        setupContract(Margin, provider, networkId);
        setupContract(Proxy, provider, networkId);
        setupContract(ERC20ShortCreator, provider, networkId);
        setupContract(ERC20LongCreator, provider, networkId);
        setupContract(SharedLoanCreator, provider, networkId);
        setupContract(Vault,provider,networkId);

        const [
            margin,
            proxy,
            erc20ShortCreator,
            erc20LongCreator,
            sharedLoanCreator,
            vault
        ] = await Promise.all([
            Margin.deployed(),
            Proxy.deployed(),
            ERC20ShortCreator.deployed(),
            ERC20LongCreator.deployed(),
            SharedLoanCreator.deployed(),
            Vault.deployed()
        ]);

        this.margin = margin;
        this.proxy = proxy;
        this.erc20ShortCreator = erc20ShortCreator;
        this.erc20LongCreator = erc20LongCreator;
        this.sharedLoanCreator = sharedLoanCreator;
        this.vault = vault;
    }
}
