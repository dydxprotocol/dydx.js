import BigNumber from 'bignumber.js';

export interface LoanOffering {
  owedToken:              string;
  heldToken:              string;
  payer:                  string;
  owner:                  string;
  taker:                  string;
  positionOwner:          string;
  feeRecipient:           string;
  lenderFeeTokenAddress:  string;
  takerFeeTokenAddress:   string;
  maxAmount:              BigNumber;
  minAmount:              BigNumber;
  minHeldToken:           BigNumber;
  lenderFee:              BigNumber;
  takerFee:               BigNumber;
  interestRate:           BigNumber;
  interestPeriod:         BigNumber;
  expirationTimestamp:    BigNumber;
  callTimeLimit:          BigNumber;
  maxDuration:            BigNumber;
  salt:                   BigNumber;
}

export interface SignedLoanOffering extends LoanOffering {
  signature: string;
}

export interface Contract {
  address: string;
}

export interface Signature {
  v: number;
  r: string;
  s: string;
}

export interface Position {
  id:                 string;
  owedToken:          string;
  heldToken:          string;
  lender:             string;
  owner:              string;
  principal:          BigNumber;
  requiredDeposit:    BigNumber;
  callTimeLimit:      BigNumber;
  startTimestamp:     BigNumber;
  callTimestamp:      BigNumber;
  maxDuration:        BigNumber;
  interestRate:       BigNumber;
  interestPeriod:     BigNumber;
}

export interface ZeroExOrder {
  maker: string;
  taker: string;
  feeRecipient: string;
  makerTokenAmount: BigNumber;
  takerTokenAmount: BigNumber;
  makerFee: BigNumber;
  takerFee: BigNumber;
  expirationUnixTimestampSec: BigNumber;
  salt: BigNumber;
  ecSignature: Signature;
}

export interface ZeroExV2Order {
  exchangeAddress: string;
  expirationTimeSeconds: BigNumber;
  feeRecipientAddress: string;
  makerAddress: string;
  makerAssetAmount: BigNumber;
  makerAssetData: string;
  makerFee: BigNumber;
  salt: BigNumber;
  senderAddress: string;
  signature: string;
  takerAddress: string;
  takerAssetAmount: BigNumber;
  takerAssetData: string;
  takerFee: BigNumber;
}

export interface ContractFunction extends Function {
  estimateGas: Function;
}

export interface Contract {
  deployed: () => Promise<ContractInstance>;
  at: (s: string) => Promise<ContractInstance>;
  setProvider: (p: Provider) => any;
  setNetwork: (n: number) => any;
}

export interface Provider {}

export interface ContractInstance {}

export interface ContractCallOptions {
  from?: string;
  value?: BigNumber;
  gas?: BigNumber | number;
  gasPrice?: BigNumber | number;
  nonce?: number;
}
