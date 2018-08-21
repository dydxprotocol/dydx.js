import BigNumber from 'bignumber.js';

export interface Deposit {
  beneficiary: string;
  bucket: BigNumber;
  amount: BigNumber;
  weight: BigNumber;
}
