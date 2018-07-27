import BigNumber from 'bignumber.js';

export interface LoanOffering {
  owedToken:              string;
  heldToken:              string;
  payer:                  string;
  signer:                 string;
  owner:                  string;
  taker:                  string;
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
  signature: Signature;
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
