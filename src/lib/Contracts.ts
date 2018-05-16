import { Margin as MarginContract } from '@dydxprotocol/protocol';
import { Proxy as ProxyContract } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';

export class Contracts {
    public margin;
    public proxy;

    constructor(
        provider
    ) {
        this.margin = contract(MarginContract);
        this.margin.setProvider(provider);

        this.proxy = contract(ProxyContract);
        this.proxy.setProvider(provider);
    }

    public setProvider(provider) {
        this.margin.setProvider(provider);
        this.proxy.setProvider(provider);
    }
}
