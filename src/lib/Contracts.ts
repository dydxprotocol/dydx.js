import {
  Margin as MarginContract,
  TokenProxy as TokenProxyContract,
  ERC20ShortFactory as ERC20ShortFactoryContract,
  ERC20LongFactory as ERC20LongFactoryContract,
  TestToken as TestTokenContract,
  Vault as VaultContract,
  OpenDirectlyExchangeWrapper as OpenDirectlyExchangeWrapperContract,
  ZeroExV1ExchangeWrapper as ZeroExV1ExchangeWrapperContract,
  ZeroExV2ExchangeWrapper as ZeroExV2ExchangeWrapperContract,
  OasisV1SimpleExchangeWrapper as OasisV1SimpleExchangeWrapperContract,
  PayableMarginMinter as PayableMarginMinterContract,
  WethPayoutRecipient as WethPayoutRecipientContract,
  BucketLender as BucketLenderContract,
  BucketLenderWithRecoveryDelay as BucketLenderWithRecoveryDelayContract,
  BucketLenderFactory as BucketLenderFactoryContract,
  BucketLenderProxy as BucketLenderProxyContract,
  EthWrapperForBucketLender as EthWrapperForBucketLenderContract,
  ERC20 as ERC20Contract,
  WETH9 as WETH9Contract,
  DutchAuctionCloser as DutchAuctionCloserContract,
  ERC20Position as ERC20PositionContract,
  ERC20PositionWithdrawer as ERC20PositionWithdrawerContract,
  ERC20PositionWithdrawerV2 as ERC20PositionWithdrawerV2Contract,
  ERC20CappedShort as ERC20CappedShortContract,
  ERC20CappedLong as ERC20CappedLongContract,
  ERC20CappedPosition as ERC20CappedPositionContract,
  AuctionProxy as AuctionProxyContract,
} from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { setupContract } from './Helpers';
import { SUBTRACT_GAS_LIMIT } from './Constants';
import Web3 from 'web3';
import bluebird from 'bluebird';
import {
  ContractFunction,
  ContractCallOptions,
  Contract,
  Provider,
  DYDXOptions,
 } from '../types';

export default class Contracts {
  public Margin: Contract = truffleContract(MarginContract);
  public TokenProxy: Contract = truffleContract(TokenProxyContract);
  public ERC20ShortFactory: Contract = truffleContract(ERC20ShortFactoryContract);
  public ERC20LongFactory: Contract = truffleContract(ERC20LongFactoryContract);
  public Vault: Contract = truffleContract(VaultContract);
  public TestToken: Contract = truffleContract(TestTokenContract);
  public OpenDirectlyExchangeWrapper: Contract =
    truffleContract(OpenDirectlyExchangeWrapperContract);
  public ZeroExV1ExchangeWrapper: Contract = truffleContract(ZeroExV1ExchangeWrapperContract);
  public ZeroExV2ExchangeWrapper: Contract = truffleContract(ZeroExV2ExchangeWrapperContract);
  public OasisV1SimpleExchangeWrapper: Contract =
    truffleContract(OasisV1SimpleExchangeWrapperContract);
  public PayableMarginMinter: Contract = truffleContract(PayableMarginMinterContract);
  public WethPayoutRecipient: Contract = truffleContract(WethPayoutRecipientContract);
  public BucketLender: Contract = truffleContract(BucketLenderContract);
  public BucketLenderRecoveryDelay: Contract =
    truffleContract(BucketLenderWithRecoveryDelayContract);
  public BucketLenderFactory: Contract = truffleContract(BucketLenderFactoryContract);
  public BucketLenderProxy: Contract = truffleContract(BucketLenderProxyContract);
  public EthWrapperForBucketLender: Contract = truffleContract(EthWrapperForBucketLenderContract);
  public ERC20: Contract = truffleContract(ERC20Contract);
  public WETH9: Contract = truffleContract(WETH9Contract);
  public DutchAuctionCloser: Contract = truffleContract(DutchAuctionCloserContract);
  public ERC20Position: Contract = truffleContract(ERC20PositionContract);
  public ERC20PositionWithdrawer: Contract = truffleContract(ERC20PositionWithdrawerContract);
  public ERC20PositionWithdrawerV2: Contract = truffleContract(ERC20PositionWithdrawerV2Contract);
  public ERC20CappedShort: Contract = truffleContract(ERC20CappedShortContract);
  public ERC20CappedLong: Contract = truffleContract(ERC20CappedLongContract);
  public ERC20CappedPosition: Contract = truffleContract(ERC20CappedPositionContract);
  public AuctionProxy: Contract = truffleContract(AuctionProxyContract);

  public margin;
  public tokenProxy;
  public erc20ShortFactory;
  public erc20LongFactory;
  public vault;
  public openDirectlyExchangeWrapper;
  public zeroExV1ExchangeWrapper;
  public zeroExV2ExchangeWrapper;
  public oasisV1SimpleExchangeWrapper;
  public web3;
  public payableMarginMinter;
  public wethPayoutRecipient;
  public bucketLenderFactory;
  public bucketLenderProxy;
  public ethWrapperForBucketLender;
  public weth9;
  public erc20PositionWithdrawer;
  public erc20PositionWithdrawerV2;
  public auctionProxy;

  public auto_gas_multiplier: number = 1.5;

  private blockGasLimit: number;

  constructor() {
    this.web3 = new Web3('');
    bluebird.promisifyAll(this.web3.eth);
  }

  public async setProvider(
    provider: Provider,
    networkId: number,
    options: DYDXOptions,
  ): Promise<void> {
    setupContract(this.Margin, provider, networkId, options);
    setupContract(this.TokenProxy, provider, networkId, options);
    setupContract(this.ERC20ShortFactory, provider, networkId, options);
    setupContract(this.ERC20LongFactory, provider, networkId, options);
    setupContract(this.Vault, provider, networkId, options);
    setupContract(this.TestToken, provider, networkId, options);
    setupContract(this.OpenDirectlyExchangeWrapper, provider, networkId, options);
    setupContract(this.ZeroExV1ExchangeWrapper, provider, networkId, options);
    setupContract(this.ZeroExV2ExchangeWrapper, provider, networkId, options);
    setupContract(this.OasisV1SimpleExchangeWrapper, provider, networkId, options);
    setupContract(this.PayableMarginMinter, provider, networkId, options);
    setupContract(this.WethPayoutRecipient, provider, networkId, options);
    setupContract(this.BucketLender, provider, networkId, options);
    setupContract(this.BucketLenderRecoveryDelay, provider, networkId, options);
    setupContract(this.BucketLenderFactory, provider, networkId, options);
    setupContract(this.BucketLenderProxy, provider, networkId, options);
    setupContract(this.EthWrapperForBucketLender, provider, networkId, options);
    setupContract(this.ERC20, provider, networkId, options);
    setupContract(this.WETH9, provider, networkId, options);
    setupContract(this.DutchAuctionCloser, provider, networkId, options);
    setupContract(this.ERC20Position, provider, networkId, options);
    setupContract(this.ERC20PositionWithdrawer, provider, networkId, options);
    setupContract(this.ERC20PositionWithdrawerV2, provider, networkId, options);
    setupContract(this.ERC20CappedShort, provider, networkId, options);
    setupContract(this.ERC20CappedLong, provider, networkId, options);
    setupContract(this.ERC20CappedPosition, provider, networkId, options);
    setupContract(this.AuctionProxy, provider, networkId, options);

    this.web3.setProvider(provider);

    const [
      margin,
      tokenProxy,
      erc20ShortFactory,
      erc20LongFactory,
      vault,
      openDirectlyExchangeWrapper,
      zeroExV1ExchangeWrapper,
      zeroExV2ExchangeWrapper,
      oasisV1SimpleExchangeWrapper,
      payableMarginMinter,
      wethPayoutRecipient,
      bucketLenderFactory,
      bucketLenderProxy,
      ethWrapperForBucketLender,
      weth9,
      erc20PositionWithdrawer,
      erc20PositionWithdrawerV2,
      auctionProxy,
    ] = await Promise.all([
      this.Margin.deployed(),
      this.TokenProxy.deployed(),
      this.ERC20ShortFactory.deployed(),
      this.ERC20LongFactory.deployed(),
      this.Vault.deployed(),
      this.OpenDirectlyExchangeWrapper.deployed(),
      this.ZeroExV1ExchangeWrapper.deployed(),
      this.ZeroExV2ExchangeWrapper.deployed(),
      this.OasisV1SimpleExchangeWrapper.deployed(),
      this.PayableMarginMinter.deployed(),
      this.WethPayoutRecipient.deployed(),
      this.BucketLenderFactory.deployed(),
      this.BucketLenderProxy.deployed(),
      this.EthWrapperForBucketLender.deployed(),
      this.WETH9.deployed(),
      this.ERC20PositionWithdrawer.deployed(),
      this.ERC20PositionWithdrawerV2.deployed(),
      this.AuctionProxy.deployed(),
    ]);

    this.margin = margin;
    this.tokenProxy = tokenProxy;
    this.erc20ShortFactory = erc20ShortFactory;
    this.erc20LongFactory = erc20LongFactory;
    this.vault = vault;
    this.openDirectlyExchangeWrapper = openDirectlyExchangeWrapper;
    this.zeroExV1ExchangeWrapper = zeroExV1ExchangeWrapper;
    this.zeroExV2ExchangeWrapper = zeroExV2ExchangeWrapper;
    this.oasisV1SimpleExchangeWrapper = oasisV1SimpleExchangeWrapper;
    this.payableMarginMinter = payableMarginMinter;
    this.wethPayoutRecipient = wethPayoutRecipient;
    this.bucketLenderFactory = bucketLenderFactory;
    this.bucketLenderProxy = bucketLenderProxy;
    this.ethWrapperForBucketLender = ethWrapperForBucketLender;
    this.weth9 = weth9;
    this.erc20PositionWithdrawer = erc20PositionWithdrawer;
    this.erc20PositionWithdrawerV2 = erc20PositionWithdrawerV2;
    this.auctionProxy = auctionProxy;
  }

  public async createNewContract(
    contract: truffleContract,
    options: ContractCallOptions,
    ...args
  ): Promise<Contract> {
    if (!this.blockGasLimit) await this.setGasLimit();
    if (!options.gas) {
      const ethContract = this.ethContract(contract.abi);
      const createData = ethContract.new.getData(...args, { ...options, data: contract.bytecode });
      const gasEstimate: number = await this.web3.eth.estimateGasAsync(
        { ...options, data: createData },
      );
      const totalGas: number = Math.floor(gasEstimate * this.auto_gas_multiplier);
      options.gas = totalGas > this.blockGasLimit
        ? this.blockGasLimit : totalGas;
    }
    return this.deploy(contract, options, ...args);
  }

  public async callContractFunction(
    func: ContractFunction,
    callOptions: ContractCallOptions,
    ...args // tslint:disable-line: trailing-comma
  ): Promise<object> {
    const { waitForConfirmation, ...options } = callOptions;
    if (!this.blockGasLimit) await this.setGasLimit();
    if (!options.gas) {
      const gasEstimate: number = await func.estimateGas(...args, options);
      const totalGas: number = Math.floor(gasEstimate * this.auto_gas_multiplier);
      options.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
    }
    if (waitForConfirmation === false) { // tslint:disable-line: no-boolean-literal-compare
      const { params: [txOptions] }: any = func.request(...args, options);
      const { from, value, ...txCallOptions } = options;
      const txHash = this.web3.eth.sendTransaction({ ...txOptions, ...txCallOptions });
      return txHash;
    }
    return func(...args, options);
  }

  private async deploy(
    contract: truffleContract,
    options: ContractCallOptions,
    ...args
  ): Promise<Contract> {
    const ethContract = this.ethContract(contract.abi);
    return new Promise<Contract>((resolve, reject) => {
      ethContract.new(
        ...args,
        { ...options, data: contract.bytecode },
        (err, contract) => {
          if (err) {
            return reject(err);
          }
          if (contract.address) {
            return resolve(<Contract>{ address: contract.address });
          }
        });
    });
  }

  private ethContract(contractABI: any): any {
    return this.web3.eth.contract(contractABI);
  }

  private async setGasLimit(): Promise<any> {
    const block = await this.web3.eth.getBlockAsync('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }
}
