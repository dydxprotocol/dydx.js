import BigNumber  from 'bignumber.js';
import bluebird from 'bluebird';
import Contracts from '../../lib/Contracts';
import { getPositionId } from '../../lib/Helpers';
import { Deposit } from '../../types/BucketLender';
import { BIG_NUMBERS } from '../../lib/Constants';
import { ContractCallOptions } from '../../types';

export default class BucketLender {
  private contracts: Contracts;

  constructor(
    contracts: Contracts,
  ) {
    this.contracts = contracts;
  }

  public async create(
    owner: string,
    positionOpener: string,
    positionNonce: BigNumber,
    heldToken: string,
    owedToken: string,
    bucketTime: BigNumber,
    positionInterestRate: BigNumber,
    positionInterestPeriod: BigNumber,
    positionMaximumDuration: BigNumber,
    positionCallTimeLimit: BigNumber,
    minHeldTokenPerPrincipalNumerator: BigNumber,
    minHeldTokenPerPrincipalDenominator: BigNumber,
    marginCallers: string[],
    from: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const trustedWithdrawers = [];

    if (owedToken.toLowerCase() === this.contracts.WETH9.address.toLowerCase()) {
      trustedWithdrawers.push(this.contracts.ethWrapperForBucketLender.address);
    }

    const positionId = getPositionId(positionOpener, positionNonce);

    const response:any = await this.contracts.callContractFunction(
      this.contracts.bucketLenderFactory.createBucketLender,
      { ...options, from },
      positionId,
      heldToken,
      owedToken,
      [
        bucketTime,
        positionInterestRate,
        positionInterestPeriod,
        positionMaximumDuration,
        positionCallTimeLimit,
        minHeldTokenPerPrincipalNumerator,
        minHeldTokenPerPrincipalDenominator,
      ],
      marginCallers,
      trustedWithdrawers,
    );

    const createdEvent = response
      .logs.find(l => l.event === 'BucketLenderCreated' && l.args.positionId === positionId);

    response.address = createdEvent.args.at;

    return response;
  }

  public async deposit(
    bucketLenderAddress: string,
    depositor: string,
    beneficiary: string,
    amount: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return await this.contracts.callContractFunction(
      bucketLender,
      { ...options, from: depositor },
      beneficiary,
      amount,
    );
  }

  public async depositETH(
    bucketLenderAddress: string,
    depositor: string,
    beneficiary: string,
    amount: BigNumber,
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.contracts.callContractFunction(
      this.contracts.ethWrapperForBucketLender.depositEth,
      { ...options, from: depositor, value: amount },
      bucketLenderAddress,
      beneficiary,
    );
  }

  public async withdraw(
    bucketLenderAddress: string,
    withdrawer: string,
    buckets: BigNumber[],
    maxWeights: BigNumber[],
    options: ContractCallOptions = {},
  ): Promise<object> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return this.contracts.callContractFunction(
      bucketLender.withdraw,
      { ...options, from: withdrawer },
      buckets,
      maxWeights,
      withdrawer,
    );
  }

  public async withdrawAll(
    bucketLenderAddress: string,
    withdrawer: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const buckets: BigNumber[] = await this.getDepositedBuckets(bucketLenderAddress, withdrawer);

    const maxWeights: BigNumber[] = buckets.map(() => BIG_NUMBERS.ONES_255);

    return this.withdraw(
      bucketLenderAddress,
      withdrawer,
      buckets,
      maxWeights,
      options,
    );
  }

  public async withdrawETH(
    bucketLenderAddress: string,
    withdrawer: string,
    buckets: BigNumber[],
    maxWeights: BigNumber[],
    options: ContractCallOptions = {},
  ): Promise<object> {
    return this.contracts.callContractFunction(
      this.contracts.ethWrapperForBucketLender.withdrawEth,
      { ...options, from: withdrawer },
      bucketLenderAddress,
      buckets,
      maxWeights,
    );
  }

  public async withdrawAllETH(
    bucketLenderAddress: string,
    withdrawer: string,
    options: ContractCallOptions = {},
  ): Promise<object> {
    const buckets: BigNumber[] = await this.getDepositedBuckets(bucketLenderAddress, withdrawer);

    const maxWeights: BigNumber[] = buckets.map(() => BIG_NUMBERS.ONES_255);

    return this.withdrawETH(
      bucketLenderAddress,
      withdrawer,
      buckets,
      maxWeights,
      options,
    );
  }

  // ============ Public Constant Contract Functions ============

  public async getTotalPrincipal(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.principalTotal.call();
  }

  public async getPrincipalForBucket(
    bucketLenderAddress: string,
    bucketNumber: BigNumber,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.principalForBucket.call(bucketNumber);
  }

  public async getTotalAvailable(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.availableTotal.call();
  }

  public async getAvailableForBucket(
    bucketLenderAddress: string,
    bucketNumber: BigNumber,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.availableForBucket.call(bucketNumber);
  }

  public async getCriticalBucket(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.criticalBucket.call();
  }

  public async getWeightForBucket(
    bucketLenderAddress: string,
    bucketNumber: BigNumber,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.weightForBucket.call(bucketNumber);
  }

  public async getWeightForBucketForAccount(
    bucketLenderAddress: string,
    bucketNumber: BigNumber,
    account: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.weightForBucketForAccount.call(bucketNumber, account);
  }

  public async getBucketTime(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.BUCKET_TIME.call();
  }

  public async getInterestRate(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.INTEREST_RATE.call();
  }

  public async getMaxDuration(
    bucketLenderAddress: string,
  ): Promise<BigNumber> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    return bucketLender.MAX_DURATION.call();
  }

  // ============ Events ============

  public async getDepositEvents(
    bucketLenderAddress: string,
    beneficiary: string,
    options: object = {},
  ): Promise<Deposit[]> {
    const bucketLender = await this.getBucketLender(bucketLenderAddress);

    const filter = bucketLender.Deposit(
      { beneficiary },
      {
        ...{
          fromBlock: 0,
          toBlock: 'latest',
        },
        ...options,
      },
    );

    const getEvents: any = bluebird.promisify(filter.get);

    return getEvents();
  }

  // ============ Private Functions ============

  private getBucketLender(
    bucketLenderAddress: string,
  ): Promise<any> {
    return this.contracts.BucketLender.at(bucketLenderAddress);
  }

  private async getDepositedBuckets(
    bucketLenderAddress: string,
    withdrawer: string,
  ): Promise<BigNumber[]> {
    const depositEvents = await this.getDepositEvents(
      bucketLenderAddress,
      withdrawer,
    );

    return depositEvents
      .map(e => e.bucket.toString())
      .filter((elem, pos, arr) => arr.indexOf(elem) === pos)
      .map(b => new BigNumber(b)); // Gets the unique bucket numbers
  }
}
