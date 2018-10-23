import { dydx } from './helpers/DYDX';
import { seeds } from '@dydxprotocol/protocol';
import BigNumber from 'bignumber.js';
import {
  setupDYDX,
  mintLongWithETH,
  getBalanceParams,
} from './helpers/MarginHelper';
import {
  ZeroExOrder,
  Position,
} from '../src/types';
import { resetEVM } from './helpers/SnapshotHelper';

describe('ContractCallOptions', () => {
  let accounts: string[] = null;

  beforeAll(async () => {
    await setupDYDX();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  beforeEach(async () => {
    await resetEVM();
  });

  describe('#Promises', () => {
    it('mints long tokens with ETH without promise', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokensToMint = new BigNumber('2e18');
      const trader = accounts[4];
      const balanceBefore = await getBalanceParams(trader, position.id);
      const txHash = await mintLongWithETH(
        position.id,
        trader,
        tokensToMint,
        order,
        { waitForConfirmation: false },
      );
      let txReceipt = await dydx.contracts.web3.eth.getTransactionReceiptAsync(txHash);
      while (txReceipt.status !== '0x1') {
        txReceipt = await dydx.contracts.web3.eth.getTransactionReceiptAsync(txHash);
      }
      const balanceAfter = await getBalanceParams(trader, position.id);
      expect(balanceBefore.positionTokenSupply.add(tokensToMint)
        .eq(balanceAfter.positionTokenSupply)).toBeTruthy();
      expect(balanceBefore.traderTokenBalance.add(tokensToMint)
        .eq(balanceAfter.traderTokenBalance)).toBeTruthy();
      const tokenBalance = await dydx.token.getBalance(position.owner, trader);
      expect(tokenBalance.equals(tokensToMint)).toBeTruthy();
    });

    it('mints long tokens with ETH with promise', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokensToMint = new BigNumber('2e18');
      const trader = accounts[4];
      const balanceBefore = await getBalanceParams(trader, position.id);
      await mintLongWithETH(
        position.id,
        trader,
        tokensToMint,
        order,
        { waitForConfirmation: true },
      );
      const balanceAfter = await getBalanceParams(trader, position.id);
      expect(balanceBefore.positionTokenSupply.add(tokensToMint)
        .eq(balanceAfter.positionTokenSupply)).toBeTruthy();
      expect(balanceBefore.traderTokenBalance.add(tokensToMint)
        .eq(balanceAfter.traderTokenBalance)).toBeTruthy();
      const tokenBalance = await dydx.token.getBalance(position.owner, trader);
      expect(tokenBalance.equals(tokensToMint)).toBeTruthy();
    });

    it('mints long tokens with ETH with promise (as default)', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokensToMint = new BigNumber('2e18');
      const trader = accounts[4];
      const balanceBefore = await getBalanceParams(trader, position.id);
      await mintLongWithETH(
        position.id,
        trader,
        tokensToMint,
        order,
      );
      const balanceAfter = await getBalanceParams(trader, position.id);
      expect(balanceBefore.positionTokenSupply.add(tokensToMint)
        .eq(balanceAfter.positionTokenSupply)).toBeTruthy();
      expect(balanceBefore.traderTokenBalance.add(tokensToMint)
        .eq(balanceAfter.traderTokenBalance)).toBeTruthy();
      const tokenBalance = await dydx.token.getBalance(position.owner, trader);
      expect(tokenBalance.equals(tokensToMint)).toBeTruthy();
    });
  });
});
