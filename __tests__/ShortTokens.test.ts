import { dydx, initialize } from './helpers/DYDX';
import { seeds } from '@dydxprotocol/protocol';
import BigNumber from 'bignumber.js';
import {
  ZeroExOrder,
  Position,
} from '../src/types';
import { resetEVM } from './helpers/SnapshotHelper';

describe('ShortToken', () => {
  let accounts: string[] = null;

  beforeAll(async () => {
    await initialize();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  beforeEach(async () => {
    await resetEVM();
  });

  describe('#mintWithETH', () => {
    it('successfully mints short tokens using ETH', async () => {
      const position: Position = seeds.positions.find(p => p.isTokenized);
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const trader: string = accounts[4];
      const tokensToMint = new BigNumber('2e18');
      const orderData: string = dydx.zeroExV1ExchangeWrapper.zeroExOrderToBytes(order);

      await dydx.shortToken.mintWithETH(
        position.id,
        trader,
        tokensToMint,
        new BigNumber('10e18'),
        false,
        dydx.zeroExV1ExchangeWrapper,
        orderData,
      );

      const tokenBalance = await dydx.token.getBalance(position.owner, trader);

      expect(tokenBalance.equals(tokensToMint)).toBeTruthy();
    });
  });
});
