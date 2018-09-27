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

    it('opens an ERC20Short', async () => {
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

    it('opens an ERC20CappedShort', async () => {
      const openTx = await setup(accounts);
      const trustedWithdrawers = [accounts[6]];
      const trustedLateClosers = [accounts[7]];
      const cap = openTx.principal.mul(4);
      const { id: positionId } = await dydx.shortToken.createCappedShort(
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
        trustedLateClosers,
        cap,
      );
      const position = await dydx.margin.getPosition(positionId);
      const tokenBalance = await dydx.token.getTotalSupply(position.owner);
      expect(position.heldToken).toBe(openTx.heldToken);
      expect(position.owedToken).toBe(openTx.owedToken);
      expect(position.lender).toBe(openTx.loanOwner);
      expect(position.principal.eq(openTx.principal)).toBeTruthy();
      expect(position.callTimeLimit.eq(openTx.callTimeLimit)).toBeTruthy();
      expect(position.maxDuration.eq(openTx.maxDuration)).toBeTruthy();
      expect(position.interestPeriod.eq(openTx.interestPeriod)).toBeTruthy();
      expect(tokenBalance.eq(position.principal)).toBeTruthy();
      const tokenCap = await dydx.shortToken.getTokenCap(position.owner);
      expect(tokenCap.eq(cap)).toBeTruthy();
    });
  });
});
