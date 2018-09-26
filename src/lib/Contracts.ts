import {
  Margin as MarginContract,
  TokenProxy as TokenProxyContract,
  ERC20ShortFactory as ERC20ShortFactoryContract,
  ERC20LongFactory as ERC20LongFactoryContract,
  SharedLoanFactory as SharedLoanFactoryContract,
  TestToken as TestTokenContract,
  Vault as VaultContract,
  ZeroExV1ExchangeWrapper as ZeroExV1ExchangeWrapperContract,
  PayableMarginMinter as PayableMarginMinterContract,
  WethPayoutRecipient as WethPayoutRecipientContract,
  BucketLender as BucketLenderContract,
  BucketLenderWithRecoveryDelay as BucketLenderWithRecoveryDelayContract,
  BucketLenderFactory as BucketLenderFactoryContract,
  EthWrapperForBucketLender as EthWrapperForBucketLenderContract,
  ERC20 as ERC20Contract,
  WETH9 as WETH9Contract,
  DutchAuctionCloser as DutchAuctionCloserContract,
  ERC20Position as ERC20PositionContract,
  ERC20PositionWithdrawer as ERC20PositionWithdrawerContract,
  ERC20CappedShort as ERC20CappedShortContract,
  ERC20CappedLong as ERC20CappedLongContract,
  ERC20CappedPosition as ERC20CappedPositionContract,
  AuctionProxy as AuctionProxyContract,
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';
import Web3 from 'web3';
import bluebird from 'bluebird';
import { ContractFunction, ContractCallOptions, Contract, Provider } from '../types';

export default class Contracts {
  public Margin: Contract = truffleContract(MarginContract);
  public TokenProxy: Contract = truffleContract(TokenProxyContract);
  public ERC20ShortFactory: Contract = truffleContract(ERC20ShortFactoryContract);
  public ERC20LongFactory: Contract = truffleContract(ERC20LongFactoryContract);
  public SharedLoanFactory: Contract = truffleContract(SharedLoanFactoryContract);
  public Vault: Contract = truffleContract(VaultContract);
  public TestToken: Contract = truffleContract(TestTokenContract);
  public ZeroExV1ExchangeWrapper: Contract = truffleContract(ZeroExV1ExchangeWrapperContract);
  public PayableMarginMinter: Contract = truffleContract(PayableMarginMinterContract);
  public WethPayoutRecipient: Contract = truffleContract(WethPayoutRecipientContract);
  public BucketLender: Contract = truffleContract(BucketLenderContract);
  public BucketLenderRecoveryDelay: Contract =
    truffleContract(BucketLenderWithRecoveryDelayContract);
  public BucketLenderFactory: Contract = truffleContract(BucketLenderFactoryContract);
  public EthWrapperForBucketLender: Contract = truffleContract(EthWrapperForBucketLenderContract);
  public ERC20: Contract = truffleContract(ERC20Contract);
  public WETH9: Contract = truffleContract(WETH9Contract);
  public DutchAuctionCloser: Contract = truffleContract(DutchAuctionCloserContract);
  public ERC20Position: Contract = truffleContract(ERC20PositionContract);
  public ERC20PositionWithdrawer: Contract = truffleContract(ERC20PositionWithdrawerContract);
  public ERC20CappedShort: Contract = truffleContract(ERC20CappedShortContract);
  public ERC20CappedLong: Contract = truffleContract(ERC20CappedLongContract);
  public ERC20CappedPosition: Contract = truffleContract(ERC20CappedPositionContract);
  public AuctionProxy: Contract = truffleContract(AuctionProxyContract);

  public margin;
  public tokenProxy;
  public erc20ShortFactory;
  public erc20LongFactory;
  public sharedLoanFactory;
  public vault;
  public zeroExV1ExchangeWrapper;
  public web3;
  public payableMarginMinter;
  public wethPayoutRecipient;
  public bucketLenderFactory;
  public ethWrapperForBucketLender;
  public weth9;
  public erc20PositionWithdrawer;
  public auctionProxy;

  public auto_gas_multiplier: number = 1.5;

  public contract_deploy_gas: number = 4000000;

  private blockGasLimit: number;

  constructor() {
    this.web3 = new Web3('');
    bluebird.promisifyAll(this.web3.eth);
  }

  public async setProvider(
    provider: Provider,
    networkId: number,
  ): Promise<void> {
    setupContract(this.Margin, provider, networkId);
    setupContract(this.TokenProxy, provider, networkId);
    setupContract(this.ERC20ShortFactory, provider, networkId);
    setupContract(this.ERC20LongFactory, provider, networkId);
    setupContract(this.SharedLoanFactory, provider, networkId);
    setupContract(this.Vault, provider, networkId);
    setupContract(this.TestToken, provider, networkId);
    setupContract(this.ZeroExV1ExchangeWrapper, provider, networkId);
    setupContract(this.PayableMarginMinter, provider, networkId);
    setupContract(this.WethPayoutRecipient, provider, networkId);
    setupContract(this.BucketLender, provider, networkId);
    setupContract(this.BucketLenderRecoveryDelay, provider, networkId);
    setupContract(this.BucketLenderFactory, provider, networkId);
    setupContract(this.EthWrapperForBucketLender, provider, networkId);
    setupContract(this.ERC20, provider, networkId);
    setupContract(this.WETH9, provider, networkId);
    setupContract(this.DutchAuctionCloser, provider, networkId);
    setupContract(this.ERC20Position, provider, networkId);
    setupContract(this.ERC20PositionWithdrawer, provider, networkId);
    setupContract(this.ERC20CappedShort, provider, networkId);
    setupContract(this.ERC20CappedLong, provider, networkId);
    setupContract(this.ERC20CappedPosition, provider, networkId);
    setupContract(this.AuctionProxy, provider, networkId);

    this.web3.setProvider(provider);

    const [
      margin,
      tokenProxy,
      erc20ShortFactory,
      erc20LongFactory,
      sharedLoanFactory,
      vault,
      zeroExV1ExchangeWrapper,
      payableMarginMinter,
      wethPayoutRecipient,
      bucketLenderFactory,
      ethWrapperForBucketLender,
      weth9,
      erc20PositionWithdrawer,
      auctionProxy,
    ] = await Promise.all([
      this.Margin.deployed(),
      this.TokenProxy.deployed(),
      this.ERC20ShortFactory.deployed(),
      this.ERC20LongFactory.deployed(),
      this.SharedLoanFactory.deployed(),
      this.Vault.deployed(),
      this.ZeroExV1ExchangeWrapper.deployed(),
      this.PayableMarginMinter.deployed(),
      this.WethPayoutRecipient.deployed(),
      this.BucketLenderFactory.deployed(),
      this.EthWrapperForBucketLender.deployed(),
      this.WETH9.deployed(),
      this.ERC20PositionWithdrawer.deployed(),
      this.AuctionProxy.deployed(),
    ]);

    this.margin = margin;
    this.tokenProxy = tokenProxy;
    this.erc20ShortFactory = erc20ShortFactory;
    this.erc20LongFactory = erc20LongFactory;
    this.sharedLoanFactory = sharedLoanFactory;
    this.vault = vault;
    this.zeroExV1ExchangeWrapper = zeroExV1ExchangeWrapper;
    this.payableMarginMinter = payableMarginMinter;
    this.wethPayoutRecipient = wethPayoutRecipient;
    this.bucketLenderFactory = bucketLenderFactory;
    this.ethWrapperForBucketLender = ethWrapperForBucketLender;
    this.weth9 = weth9;
    this.erc20PositionWithdrawer = erc20PositionWithdrawer;
    this.auctionProxy = auctionProxy;
  }

  public async createNewContract(
    contract: truffleContract,
    options: ContractCallOptions,
    ...args
  ): Promise<Contract> {
    if (!this.blockGasLimit) await this.setGasLimit();
    if (!options.gas) {
      const totalGas = Math.floor(this.contract_deploy_gas * this.auto_gas_multiplier);
      options.gas = totalGas < this.blockGasLimit
        ? this.blockGasLimit : totalGas;
    }
    return contract.new(...args, options);
  }

  public async callContractFunction(
    func: ContractFunction,
    options: ContractCallOptions,
    ...args // tslint:disable-line: trailing-comma
  ): Promise<object> {
    if (!this.blockGasLimit) await this.setGasLimit();

    if (!options.gas) {
      const gasEstimate: number = await func.estimateGas(...args, options);
      const totalGas: number = Math.floor(gasEstimate * this.auto_gas_multiplier);
      options.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
    }
    return func(...args, options);
  }

  private async setGasLimit(): Promise<any> {
    const block = await this.web3.eth.getBlockAsync('latest');
    this.blockGasLimit = block.gasLimit;
  }
}
