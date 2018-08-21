<p align="center"><img src="https://dydx.exchange/images/logo.png" width="256" /></p>

<p align="center">
  <a href="https://circleci.com/gh/dydxprotocol/workflows/dydx.js/tree/master">
    <img src="https://circleci.com/gh/dydxprotocol/dydx.js/tree/master.svg?style=svg&circle-token=96657b90b74f5abf64508e80a9acb536d87dbd4a" />
  </a>
  <a href='https://coveralls.io/github/dydxprotocol/dydx.js?branch=master'>
    <img src='https://coveralls.io/repos/github/dydxprotocol/dydx.js/badge.svg?branch=master&amp;t=oTubHH' alt='Coverage Status' />
  </a>
</p>

A TypeScript/Javascript library for interacting with the dYdX protocol.

## Usage

### Install

```
npm install --save @dydxprotocol/dydx.js
```

### Initialize

```javascript
import { DYDX } from '@dydxprotocol/dydx.js';

const dydx = new DYDX();
await dydx.initialize(provider, networkId);
```

### Short & Leveraged Tokens

#### Mint

```javascript
await dydx.shortToken.mint(
  positionId,
  trader,
  tokensToMint,
  payInHeldToken,
  exchangeWrapper,
  orderData,
  options,
);
```

Or mint with ETH:

```javascript
await dydx.shortToken.mintWithETH(
  positionId,
  trader,
  tokensToMint,
  ethToSend,
  ethIsHeldToken,
  exchangeWrapper,
  orderData,
  options,
);
```

## Development

### Install

```
npm install
```

### Compile

```
npm run build
```
