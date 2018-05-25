import { Contracts } from '../lib/Contracts';
import BigNumber from 'bignumber.js';
import { ERC20 } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';
import { BIGNUMBERS } from '../lib/Constants';
import { setupContract } from '../lib/Helpers';

const Token = contract(ERC20);

export class TokenHelper {
    private contracts: Contracts;

    constructor(
        provider,
        networkId: number,
        contracts: Contracts
    ) {
        setupContract(Token, provider, networkId);

        this.contracts = contracts;
    }

    public async getAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string
    ): Promise<BigNumber> {
        const token = await this.getToken(tokenAddress);

        return token.allowance.call(ownerAddress, spenderAddress);
    }

    public async getBalance(
        tokenAddress: string,
        ownerAddress: string
    ): Promise<BigNumber> {
        const token = await this.getToken(tokenAddress);

        return token.balanceOf.call(ownerAddress);
    }

    public async getProxyAllowance(
        tokenAddress: string,
        ownerAddress: string
    ): Promise<BigNumber> {
        return this.getAllowance(
            tokenAddress,
            ownerAddress,
            this.contracts.proxy.address
        );
    }

    public async setAllowance(
        tokenAddress: string,
        ownerAddress: string,
        spenderAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = await this.getToken(tokenAddress);

        return token.approve(spenderAddress, amount, {...options, from: ownerAddress });
    }

    public async setProxyAllowance(
        tokenAddress: string,
        ownerAddress: string,
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

    public async setMaximumAllowance(
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

    public async setMaximumProxyAllowance(
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

    public async transfer(
        tokenAddress: string,
        fromAddress: string,
        toAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = await this.getToken(tokenAddress);

        return token.transfer(toAddress, amount, {...options, from: fromAddress });
    }

    public async transferFrom(
        tokenAddress: string,
        fromAddress: string,
        toAddress: string,
        senderAddress: string,
        amount: BigNumber,
        options: object = {}
    ): Promise<object> {
        const token = await this.getToken(tokenAddress);

        return token.transferFrom(
            fromAddress,
            toAddress,
            amount,
            {...options, from: senderAddress }
        );
    }

    public setProvider(provider, networkId: number) {
        setupContract(Token, provider, networkId);
    }

    private getToken(
        tokenAddress: string
    ): Promise<any> {

        return Token.at(tokenAddress);
    }
}
