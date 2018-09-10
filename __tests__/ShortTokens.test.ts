import { dydx } from './helpers/DYDX';
import { seeds } from '@dydxprotocol/protocol';
import BigNumber from 'bignumber.js';
import { setup, setupDYDX } from './helpers/MarginHelper';
import {
  ZeroExOrder,
  Position,
} from '../src/types';
import { resetEVM } from './helpers/SnapshotHelper';

describe('ShortToken', () => {
  let accounts: string[] = null;

  beforeAll(async () => {
    await setupDYDX();
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

    it('opens a tokenized short', async () => {
      const openTx = await setup(accounts);
      const createdShort = await dydx.shortToken.create(
        openTx.trader,
        openTx.loanOwner,
        openTx.owedToken,
        openTx.heldToken,
        openTx.nonce,
        openTx.deposit,
        openTx.principal,
        openTx.callTimeLimit,
        openTx.maxDuration,
        openTx.interestRate,
        openTx.interestPeriod,
      );
      const positionId = dydx.margin.getPositionId(openTx.trader, openTx.nonce);
      const { owner } = await dydx.margin.getPosition(positionId);
      expect(createdShort.tokenAddress).toBe(owner);
    });
  });
});
