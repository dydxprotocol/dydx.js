import { Contracts } from '../lib/Contracts';
import BigNumber from 'bignumber.js';
import { ERC20 } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';
import { BIGNUMBERS } from '../lib/Constants';

export class TokenHelper {
    private contracts: Contracts;
    private provider;

    constructor(
        provider,
        contracts: Contracts
    ) {
        this.provider = provider;
        this.contracts = contracts;
    }

    public getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const token = this.getToken(tokenAddress);

        return token.allowance.call(ownerAddress, spenderAddress);
    }

    public getBalance(
        tokenAddress: string,
        ownerAddress: string
    ): Promise<BigNumber> {
        const token = this.getToken(tokenAddress);

        return token.balanceOf.call(ownerAddress);
    }

    public getProxyAllowance(
        tokenAddress: string,
        ownerAddress: string
    ): Promise<BigNumber> {
        return this.getAllowance(
            tokenAddress,
            ownerAddress,
            this.contracts.proxy.address
        );
    }

    public setAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = this.getToken(tokenAddress);

        return token.approve(spenderAddress, amount, {...options, from: ownerAddress });
    }

    public setProxyAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        return this.setAllowance(
            tokenAddress,
            ownerAddress,
            this.contracts.proxy.address,
            amount,
            options
        );
    }

    public setMaximumAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string,
        options: object = {}
    ): Promise<object> {
        return this.setAllowance(
            tokenAddress,
            ownerAddress,
            spenderAddress,
            BIGNUMBERS.ONES_255,
            options
        );
    }

    public setMaximumProxyAllowance(
        tokenAddress: string,
        ownerAddress: string,
        options: object = {}
    ): Promise<object> {
        return this.setAllowance(
            tokenAddress,
            ownerAddress,
            this.contracts.proxy.address,
            BIGNUMBERS.ONES_255,
            options
        );
    }

    public transfer(
        tokenAddress: string,
        fromAddress: string,
        toAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = this.getToken(tokenAddress);

        return token.transfer(toAddress, amount, {...options, from: fromAddress });
    }

    public transferFrom(
        tokenAddress: string,
        fromAddress: string,
        toAddress: string,
        senderAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = this.getToken(tokenAddress);

        return token.transferFrom(
            fromAddress,
            toAddress,
            amount,
            {...options, from: senderAddress }
        );
    }

    public setProvider(provider) {
        this.provider = provider;
    }

    private getToken(
        tokenAddress: string
    ) {
        const token = contract(ERC20);
        token.setProvider(this.provider);

        return token;
    }
}
