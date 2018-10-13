<p align="center"><img src="https://dydx.exchange/images/logo.png" width="256" /></p>

<p align="center">
  <a href="https://circleci.com/gh/dydxprotocol/workflows/dydx.js/tree/master">
    <img src="https://img.shields.io/circleci/project/github/dydxprotocol/dydx.js.svg" alt='CI' />
  </a>
  <a href='https://coveralls.io/github/dydxprotocol/dydx.js?branch=master'>
    <img src='https://coveralls.io/repos/github/dydxprotocol/dydx.js/badge.svg?branch=master&amp;t=oTubHH' alt='Coverage Status' />
  </a>
  <a href='https://github.com/dydxprotocol/dydx.js/blob/master/LICENSE'>
    <img src='https://img.shields.io/github/license/dydxprotocol/dydx.js.svg?longCache=true' alt='License' />
  </a>
  <a href='https://www.npmjs.com/package/@dydxprotocol/dydx.js'>
    <img src='https://img.shields.io/npm/v/@dydxprotocol/dydx.js.svg' alt='NPM' />
  </a>
  <a href='https://slack.dydx.exchange/'>
    <img src='https://img.shields.io/badge/chat-on%20slack-brightgreen.svg?longCache=true' alt='Slack' />
  </a>
</p>

A TypeScript library for interacting with the dYdX protocol.

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
