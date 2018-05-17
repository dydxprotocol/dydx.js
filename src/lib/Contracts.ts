import { Margin as MarginContract } from '@dydxprotocol/protocol';
import { Proxy as ProxyContract } from '@dydxprotocol/protocol';
import { ERC20ShortCreator } from '@dydxprotocol/protocol';
import { ERC20LongCreator } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';

export class Contracts {
    public margin;
    public proxy;
    public erc20ShortCreator;
    public erc20LongCreator;

    constructor(
        provider
    ) {
        this.margin = contract(MarginContract);
        this.margin.setProvider(provider);

        this.proxy = contract(ProxyContract);
        this.proxy.setProvider(provider);

        this.erc20ShortCreator = contract(ERC20ShortCreator);
        this.erc20ShortCreator.setProvider(provider);

        this.erc20LongCreator = contract(ERC20LongCreator);
        this.erc20LongCreator.setProvider(provider);
    }

    public setProvider(provider) {
        this.margin.setProvider(provider);
        this.proxy.setProvider(provider);
        this.erc20ShortCreator.setProvider(provider);
        this.erc20LongCreator.setProvider(provider);
    }
}
