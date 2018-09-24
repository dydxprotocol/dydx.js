import BigNumber from 'bignumber.js';
import { dydx } from './DYDX';
import bluebird from 'bluebird';

export const LenderArgs = {
  principal: new BigNumber(100),
  collateral: new BigNumber(0),
  ownerAddress: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  bucketOwner: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  from: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
  interestRate: new BigNumber(5),
  interestPeriodSeconds: new BigNumber(10),
  callTimeSeconds: new BigNumber(100),
  maxDurationSeconds: new BigNumber(100909),
  nonce: new BigNumber(3498234234),
  bucketTime: new BigNumber(3234243243),
  minHeldTokenPerPrincipalNumerator: new BigNumber(0),
  minHeldTokenPerPrincipalDenominator: new BigNumber(1),
  trader: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  positionOpener: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  marginCallers: [
    '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ],
  heldToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  owedToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
};

export async function getBucketLenderCreatedEvent(
  id: string,
): Promise<any> {
  const bucketLenderCreatedFilter = dydx.contracts.bucketLenderFactory
    .BucketLenderCreated({ positionId: id }, { fromBlock: 0, toBlock: 'latest' });
  bluebird.promisifyAll(bucketLenderCreatedFilter);

  const [bucketLenderCreatedEvent] = await bucketLenderCreatedFilter.getAsync();
  return bucketLenderCreatedEvent;
}

export const isEthereumAddress = new RegExp(/^(0x){1}[0-9a-fA-F]{40}$/i);
