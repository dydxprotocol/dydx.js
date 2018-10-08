import BigNumber  from 'bignumber.js';
import web3Utils from 'web3-utils';
import { DateTime } from 'luxon';
import { Contract, Provider, DYDXOptions } from '../types';

export function setupContract(
  contract: Contract,
  provider: Provider,
  networkId: number,
  options?: DYDXOptions,
): void {
  contract.setProvider(provider);
  contract.setNetwork(networkId);
  if (options && options.synchronizationTimeout) {
    contract.synchronization_timeout = options.synchronizationTimeout;
  }
}

export function getPositionId(
  trader: string,
  nonce: BigNumber,
): string {
  return web3Utils.soliditySha3(
    trader,
    nonce,
  );
}

export function convertInterestRateToProtocol(
  interestRate: BigNumber,
): BigNumber {
  return interestRate.mul(new BigNumber('1e6')).floor();
}

export function convertInterestRateFromProtocol(
  interestRate: BigNumber,
): BigNumber {
  return interestRate.div(new BigNumber('1e6'));
}

export function getCurrentEpochSeconds(
): BigNumber {
  return new BigNumber(DateTime.local().toMillis()).div(1000).floor();
}
