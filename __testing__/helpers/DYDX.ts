import { DYDX } from '../../src/DYDX';
import { ENVIRONMENT } from './Constants';
export let dydx = null;

export function setDYDXProvider(provider) {
  if (dydx === null) {
    dydx = new DYDX(provider, Number(ENVIRONMENT.TEST_NETWORK_ID));
  } else {
    dydx.setProvider(provider);
  }
}
