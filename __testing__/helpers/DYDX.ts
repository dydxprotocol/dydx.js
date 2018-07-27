import { DYDX } from '../../src/DYDX';
export let dydx = null;

export function setDYDXProvider(provider) {
  if (dydx === null) {
    dydx = new DYDX(provider, Number(process.env.TEST_NETWORK_ID));
  } else {
    dydx.setProvider(provider);
  }
}
