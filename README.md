<p align="center"><img src="https://s3.amazonaws.com/dydx-assets/logo_large_white.png" width="256" /></p>

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

Or mint directly (you will put up all held token [DAI for sETH] and will receive owed token [WETH for sETH]):
```javascript
// Set your allowance on our proxy contract - you only need to do this once
await dydx.token.setMaximumProxyAllowance(
  heldTokenAddress, // DAI address for sETH
  traderAddress, // your address
);

await dydx.shortToken.mintDirectly(
  positionId, // Can get from expo API
  trader, // your address
  tokensToMint, // BigNumber - Number of tokens to mint in base units (10^18 is 1 sETH)
);
```

#### Close

Close directly (you will pay all owed token owed to lenders [WETH for sETH] and will receive all held token collateral [DAI for sETH])
```javascript
// Set your allowance on our proxy contract - you only need to do this once
await dydx.token.setMaximumProxyAllowance(
  owedTokenAddress, // WETH address for sETH
  traderAddress, // your address
);

await dydx.shortToken.closeDirectly(
  positionId, // Can get from expo API
  closer, // your address
  tokensToClose, // BigNumber - Number of tokens to close in base units (10^18 is 1 sETH)
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
