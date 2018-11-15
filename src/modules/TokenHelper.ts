import BigNumber from 'bignumber.js';
import Contracts from '../lib/Contracts';
import { BIG_NUMBERS } from '../lib/Constants';

export default class TokenHelper {
  private contracts: Contracts;
  private tokens: object;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
    this.tokens = {};
  }

  public async getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
  ): Promise<BigNumber> {
    const token = await this.getToken(tokenAddress);

    return token.allowance.call(ownerAddress, spenderAddress);
  }

  public async getBalance(
    tokenAddress: string,
    ownerAddress: string,
  ): Promise<BigNumber> {
    const token = await this.getToken(tokenAddress);

    return token.balanceOf.call(ownerAddress);
  }

  public async getTotalSupply(tokenAddress: string): Promise<BigNumber> {
    const token = await this.getToken(tokenAddress);

    return token.totalSupply.call();
  }

  public async getName(tokenAddress: string): Promise<string> {
    const token = await this.getToken(tokenAddress);
    return token.name.call();
  }

  public async getSymbol(tokenAddress: string): Promise<string> {
    const token = await this.getToken(tokenAddress);
    return token.symbol.call();
  }

  public async getDecimals(tokenAddress: string): Promise<BigNumber> {
    const token = await this.getToken(tokenAddress);
    return token.decimals.call();
  }

  public async getProxyAllowance(
    tokenAddress: string,
    ownerAddress: string,
  ): Promise<BigNumber> {
    return this.getAllowance(
      tokenAddress,
      ownerAddress,
      this.contracts.tokenProxy.address,
    );
  }

  public async setAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    amount: BigNumber,
    options: object = {},
  ): Promise<object> {
    const token = await this.getToken(tokenAddress);

    return this.contracts.callContractFunction(
      token.approve,
      { ...options, from: ownerAddress },
      spenderAddress,
      amount,
    );
  }

  public async setProxyAllowance(
    tokenAddress: string,
    ownerAddress: string,
    amount: BigNumber,
    options: object = {},
  ): Promise<object> {
    return this.setAllowance(
      tokenAddress,
      ownerAddress,
      this.contracts.tokenProxy.address,
      amount,
      options,
    );
  }

  public async setMaximumAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string,
    options: object = {},
  ): Promise<object> {
    return this.setAllowance(
      tokenAddress,
      ownerAddress,
      spenderAddress,
      BIG_NUMBERS.ONES_255,
      options,
    );
  }

  public async setMaximumProxyAllowance(
    tokenAddress: string,
    ownerAddress: string,
    options: object = {},
  ): Promise<object> {
    return this.setAllowance(
      tokenAddress,
      ownerAddress,
      this.contracts.tokenProxy.address,
      BIG_NUMBERS.ONES_255,
      options,
    );
  }

  public async unsetProxyAllowance(
    tokenAddress: string,
    ownerAddress: string,
    options: object = {},
  ): Promise<object> {
    return this.setAllowance(
      tokenAddress,
      ownerAddress,
      this.contracts.tokenProxy.address,
      BIG_NUMBERS.ZERO,
      options,
    );
  }

  public async transfer(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BigNumber,
    options: object = {},
  ): Promise<object> {
    const token = await this.getToken(tokenAddress);

    return this.contracts.callContractFunction(
      token.transfer,
      { ...options, from: fromAddress },
      toAddress,
      amount,
    );
  }

  public async transferFrom(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    senderAddress: string,
    amount: BigNumber,
    options: object = {},
  ): Promise<object> {
    const token = await this.getToken(tokenAddress);

    return this.contracts.callContractFunction(
      token.transferFrom,
      { ...options, from: senderAddress },
      fromAddress,
      toAddress,
      amount,
    );
  }

  private async getToken(
    tokenAddress: string,
  ): Promise<any> {
    if (this.tokens[tokenAddress]) {
      return this.tokens[tokenAddress];
    }

    const contract = await this.contracts.ERC20Position.at(tokenAddress);

    if (contract) {
      this.tokens[tokenAddress] = contract;
    }

    return contract;
  }
}
