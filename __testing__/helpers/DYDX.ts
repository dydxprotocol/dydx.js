import { DYDX } from '../../src/DYDX';
export const dydx = new DYDX();

export async function initialize(provider) {
  await dydx.initialize(provider, Number(process.env.TEST_NETWORK_ID));
}
