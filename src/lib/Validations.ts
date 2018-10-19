import BigNumber from 'bignumber.js';
import { BIG_NUMBERS } from './Constants';

export function validateUint32(num: BigNumber): void {
  if (num.gt(BIG_NUMBERS.ONES_31)) {
    throw new Error('Number too large, cannot be stored as uint32');
  }
}
