import BigNumber from 'bignumber.js';

export interface Deposit {
  args: {
    beneficiary: string;
    bucket: BigNumber;
    amount: BigNumber;
    weight: BigNumber;
  };
}
