import { LoanOffering, SignedLoanOffering, Position } from '../types';
import { ExchangeWrapper } from './ExchangeWrapper';
import bluebird from 'bluebird';
import ethereumjsUtil from 'ethereumjs-util';
import { BigNumber } from 'bignumber.js';
import { Margin as MarginContract } from '@dydxprotocol/protocol';
import truffleContract from 'truffle-contract';
import { Contracts } from '../lib/Contracts';
import web3Utils from 'web3-utils';

export class TestUtils {
  private contracts: Contracts;

  constructor(
        contracts: Contracts,
    ) {
    this.contracts = contracts;
  }

    // ========== Public Constant Helper Functions
}
