import { dydx } from '../helpers/DYDX';
import { seeds } from '@dydxprotocol/protocol';
import BigNumber from 'bignumber.js';
import { setup, setupDYDX } from '../helpers/MarginHelper';
import {
  ZeroExOrder,
  Position,
} from '../../src/types';
import { resetEVM } from '../helpers/SnapshotHelper';

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
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.owedToken === dydx.contracts.WETH9.address,
      );
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

    it('Allows lender address to be passed in', async () => {
      const position: Position = seeds.positions.find(
        p => p.isTokenized && p.owedToken === dydx.contracts.WETH9.address,
      );
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
        {},
        position.lender,
      );

      const tokenBalance = await dydx.token.getBalance(position.owner, trader);

      expect(tokenBalance.equals(tokensToMint)).toBeTruthy();
    });
  });

  describe('#create', () => {
    it('creates an ERC20Short', async () => {
      const openTx = await setup(accounts);
      const createdShort: any = await dydx.shortToken.create(
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

  describe('#createCappedShort', () => {
    it('opens an ERC20CappedShort', async () => {
      const name = 'CAPPEDSHORT TOKEN_NAME';
      const symbol = 'CS TOKEN_SYMBOL';
      const decimals = new BigNumber(66);
      const openTx = await setup(accounts);
      const trustedLateClosers = [accounts[7]];
      const cap = openTx.principal.mul(4);
      const { id: positionId, tokenAddress }: any = await dydx.shortToken.createCappedShort(
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
        name,
        symbol,
        decimals,
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
      expect(position.owner).toBe(tokenAddress);
      const tokenCap = await dydx.shortToken.getTokenCap(position.owner);
      expect(tokenCap.eq(cap)).toBeTruthy();
      const [
        tokenName,
        tokenSymbol,
        tokenDecimals,
        owner,
      ] = await Promise.all([
        dydx.token.getName(tokenAddress),
        dydx.token.getSymbol(tokenAddress),
        dydx.token.getDecimals(tokenAddress),
        dydx.shortToken.getCappedOwner(tokenAddress),
      ]);
      expect(tokenName).toBe(name);
      expect(tokenSymbol).toBe(symbol);
      expect(tokenDecimals.eq(decimals)).toBeTruthy();
      expect(owner).toBe(openTx.trader);
      await dydx.shortToken.transferCappedOwnership(
        tokenAddress,
        openTx.trader,
        accounts[8],
      );
      const newOwner = await dydx.shortToken.getCappedOwner(tokenAddress);
      expect(newOwner).toBe(accounts[8]);
    });
  });
});
