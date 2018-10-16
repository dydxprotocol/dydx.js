import { dydx } from '../helpers/DYDX';
import { seeds } from '@dydxprotocol/protocol';
import BigNumber from 'bignumber.js';
import {
  setup,
  setupDYDX,
  mintLongWithETH,
  mintLongInHeldToken,
  getBalanceParams,
  zeroExToBytes,
} from '../helpers/MarginHelper';
import {
  ZeroExOrder,
  Position,
} from '../../src/types';
import { resetEVM } from '../helpers/SnapshotHelper';

describe('LeveragedToken', () => {
  let accounts: string[] = null;

  beforeAll(async () => {
    await setupDYDX();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  beforeEach(async () => {
    await resetEVM();
  });

  describe('#mintWithETH', () => {
    it('opens an ERC20Long', async () => {
      const openTx = await setup(accounts);
      const createdLong: any = await dydx.leveragedToken.create(
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
      expect(createdLong.tokenAddress).toBe(owner);
    });

    it('opens an ERC20CappedLong', async () => {
      const openTx = await setup(accounts);
      const trustedLateClosers = [accounts[7]];
      const cap = openTx.principal.mul(4);
      const { id: positionId, tokenAddress }: any = await dydx.leveragedToken.createCappedLong(
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
      expect(tokenBalance.eq(openTx.deposit)).toBeTruthy();
      expect(position.owner).toBe(tokenAddress);
      const tokenCap = await dydx.leveragedToken.getTokenCap(position.owner);
      expect(tokenCap.eq(cap)).toBeTruthy();
    });

    it('succesfully mints long tokens with ETH', async () => {
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

    it('mints long tokens with WETH', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokensToMint = new BigNumber('2e18');
      const trader = accounts[4];
      const WETH = dydx.contracts.weth9;
      const WETHDeposit = new BigNumber('10e18');
      await Promise.all([
        WETH.deposit({ value: WETHDeposit, from: trader }),
        WETH.approve(dydx.contracts.TokenProxy.address, WETHDeposit, { from: trader }),
      ]);
      const balanceBefore = await getBalanceParams(trader, position.id);
      await mintLongInHeldToken(
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

    it('closes a long token with WETH', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokens = new BigNumber('2e18');
      const trader = accounts[4];
      const WETH = dydx.contracts.weth9;
      const WETHDeposit = new BigNumber('10e18');
      await Promise.all([
        WETH.deposit({ value: WETHDeposit, from: trader }),
        WETH.approve(dydx.contracts.TokenProxy.address, WETHDeposit, { from: trader }),
      ]);
      await mintLongInHeldToken(
        position.id,
        trader,
        tokens,
        order,
      );
      const orderToClose: ZeroExOrder = seeds.orders.find(
        o => o.makerTokenAddress === position.owedToken,
      );
      const orderDataClose = zeroExToBytes(orderToClose);
      const beforeBalClose = await getBalanceParams(trader, position.id);
      await dydx.leveragedToken.close(
        position.id,
        trader,
        tokens,
        true,
        dydx.zeroExV1ExchangeWrapper,
        orderDataClose,
      );
      const afterBalClose = await getBalanceParams(trader, position.id);
      const closedEvents = await dydx.margin.getAllPositionClosedEvents(position.id);
      const args = closedEvents[0].args;
      const sumPayOut = args.payoutAmount.add(args.buybackCostInHeldToken);
      expect(beforeBalClose.traderTokenBalance.sub(tokens)
        .eq(afterBalClose.traderTokenBalance)).toBeTruthy();
      expect(sumPayOut.eq(tokens)).toBeTruthy();
    });

    it('closes a long and gives back DAI', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const order: ZeroExOrder = seeds.orders.find(o => o.makerTokenAddress === position.heldToken);
      const tokens = new BigNumber('2e18');
      const trader = accounts[4];
      await mintLongWithETH(
        position.id,
        trader,
        tokens,
        order,
      );
      const orderToClose: ZeroExOrder = seeds.orders.find(
        o => o.makerTokenAddress === position.owedToken,
      );
      const orderDataClose = zeroExToBytes(orderToClose);
      const beforeBalClose = await getBalanceParams(trader, position.id);
      const traderDAIBalance = await dydx.token.getBalance(position.owedToken, trader);
      expect(traderDAIBalance.eq(new BigNumber(0))).toBeTruthy();
      await dydx.leveragedToken.close(
        position.id,
        trader,
        tokens,
        false,
        dydx.zeroExV1ExchangeWrapper,
        orderDataClose,
      );
      const traderDAIBalanceAfter = await dydx.token.getBalance(position.owedToken, trader);
      expect(traderDAIBalanceAfter.eq(new BigNumber(0))).toBeFalsy();
      const afterBalClose = await getBalanceParams(trader, position.id);
      expect(beforeBalClose.traderTokenBalance.sub(tokens)
        .eq(afterBalClose.traderTokenBalance)).toBeTruthy();
    });

    it('successfully closes a long with an ETH payout', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const orderToMint: ZeroExOrder = seeds.orders.find(
        o => o.makerTokenAddress === position.heldToken,
      );
      const tokens = new BigNumber('2e18');
      const trader = accounts[4];
      await mintLongWithETH(
        position.id,
        trader,
        tokens,
        orderToMint,
      );
      const afterBalMint = await getBalanceParams(trader, position.id);
      expect(afterBalMint.traderTokenBalance.eq(tokens)).toBeTruthy();
      const orderToClose: ZeroExOrder = seeds.orders.find(
       o => o.makerTokenAddress === position.owedToken,
      );
      const orderDataClose: string = zeroExToBytes(orderToClose);
      const beforeBalClose = await getBalanceParams(trader, position.id);
      await dydx.leveragedToken.closeWithETHPayout(
        position.id,
        trader,
        tokens,
        true,
        dydx.zeroExV1ExchangeWrapper,
        orderDataClose,
      );
      const afterBalClose = await getBalanceParams(trader, position.id);
      const closedEvents = await dydx.margin.getAllPositionClosedEvents(position.id);
      const args = closedEvents[0].args;
      const sumPayOut = args.payoutAmount.add(args.buybackCostInHeldToken);
      expect(beforeBalClose.traderTokenBalance.sub(tokens)
        .eq(afterBalClose.traderTokenBalance)).toBeTruthy();
      expect(sumPayOut.eq(tokens)).toBeTruthy();
    });

    it('successfully closes multiple positions with ETH', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.heldToken === dydx.contracts.WETH9.address,
      );
      const orderToMint: ZeroExOrder = seeds.orders.find(
        o => o.makerTokenAddress === position.heldToken,
      );
      const tokensA = new BigNumber('2e18');
      const tokensB = new BigNumber('234e16');
      const traderA = accounts[5];
      const traderB = accounts[6];
      await mintLongWithETH(
        position.id,
        traderA,
        tokensA,
        orderToMint,
      );
      await mintLongWithETH(
        position.id,
        traderB,
        tokensB,
        orderToMint,
      );
      const afterBalMintA = await getBalanceParams(traderA, position.id);
      const afterBalMintB = await getBalanceParams(traderB, position.id);
      expect(afterBalMintA.traderTokenBalance.eq(tokensA)).toBeTruthy();
      expect(afterBalMintB.traderTokenBalance.eq(tokensB)).toBeTruthy();
      const orderToClose: ZeroExOrder = seeds.orders.find(
       o => o.makerTokenAddress === position.owedToken,
      );
      const orderDataClose: string = dydx.zeroExV1ExchangeWrapper.zeroExOrderToBytes(orderToClose);
      const beforeBalCloseA = await getBalanceParams(traderA, position.id);
      await dydx.leveragedToken.closeWithETHPayout(
        position.id,
        traderA,
        tokensA,
        true,
        dydx.zeroExV1ExchangeWrapper,
        orderDataClose,
      );
      const afterBalCloseA = await getBalanceParams(traderA, position.id);
      const closedEvents = await dydx.margin.getAllPositionClosedEvents(position.id);
      const argsA = closedEvents[0].args;
      const sumPayOutA = argsA.payoutAmount.add(argsA.buybackCostInHeldToken);
      expect(beforeBalCloseA.traderTokenBalance.sub(tokensA)
        .eq(afterBalCloseA.traderTokenBalance)).toBeTruthy();
      expect(sumPayOutA.eq(tokensA)).toBeTruthy();
      const beforeBalCloseB = await getBalanceParams(traderB, position.id);
      await dydx.leveragedToken.closeWithETHPayout(
        position.id,
        traderB,
        tokensB,
        true,
        dydx.zeroExV1ExchangeWrapper,
        orderDataClose,
      );
      const afterBalCloseB = await getBalanceParams(traderA, position.id);
      const closedEventsB: any = await dydx.margin.getAllPositionClosedEvents(position.id);
      const closedEventB = closedEventsB.find(event => event.args.closer === traderB);
      const argsB = closedEventB.args;
      const sumPayOutB = argsB.payoutAmount.add(argsB.buybackCostInHeldToken);
      expect(beforeBalCloseB.traderTokenBalance.sub(tokensB)
        .eq(afterBalCloseB.traderTokenBalance)).toBeTruthy();
      expect(sumPayOutB.eq(tokensB)).toBeTruthy();
    }, 10000);
  });
});
