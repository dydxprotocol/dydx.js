import { dydx } from './helpers/DYDX';
import {
  callOpenWithoutCounterparty,
  issueAndSetAllowance,
  setup,
  setupDYDX,
} from './helpers/MarginHelper';

let accounts = null;

describe('#closeWithoutCounterparty', () => {
  beforeAll(async () => {
    await setupDYDX();
    accounts = await dydx.contracts.web3.eth.getAccountsAsync();
  });

  it('successfully closes and emits event', async () => {
    const openTx = await setup(accounts);
      // open first position
    const tx = await callOpenWithoutCounterparty(openTx);
    openTx.id = tx.id;

    await issueAndSetAllowance(
      openTx.owedToken,
      openTx.positionOwner,
      openTx.principal.times(2),
      dydx.contracts.TokenProxy.address,
    );

    await dydx.margin.closePositionDirectly(
      openTx.id,
      openTx.positionOwner,
      openTx.positionOwner,
      openTx.principal,
      { gas: 1000000 },
    );

    const closed = await dydx.margin.isPositionClosed(openTx.id);
    const closedEvents = await dydx.margin.getAllPositionClosedEvents(openTx.id);
    const mostRecent = closedEvents[closedEvents.length - 1];
    expect(mostRecent.args.positionId).toBe(openTx.id);
    expect(mostRecent.args.closeAmount.equals(openTx.principal)).toBeTruthy();
    expect(mostRecent.args.closer).toBe(openTx.positionOwner);
    expect(mostRecent.args.payoutRecipient).toBe(openTx.positionOwner);
    expect(closed).toBe(true);

  }, 10000);

  it('Fails if positionId already existed, but was closed', async () => {

    const openTx = await setup(accounts);
      // open first position
    const tx = await callOpenWithoutCounterparty(openTx);
    openTx.id = tx.id;

    await issueAndSetAllowance(
        openTx.owedToken,
        openTx.positionOwner,
        openTx.principal.times(2),
        dydx.contracts.TokenProxy.address,
      );

    await dydx.margin.closePositionDirectly(
          openTx.id,
          openTx.positionOwner,
          openTx.positionOwner,
          openTx.principal,
          { gas: 1000000 },
      );

    const closed = await dydx.margin.isPositionClosed(openTx.id);
    expect(closed).toBe(true);

    await expect(
       callOpenWithoutCounterparty(
         openTx,
         { shouldContain: true },
       ),
     ).rejects.toThrow(/VM Exception while processing transaction: revert/);

  }, 10000);
});
