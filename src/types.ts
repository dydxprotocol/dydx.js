import bignumberJs from 'bignumber.js';

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
  maxAmount:              bignumberJs;
  minAmount:              bignumberJs;
  minHeldToken:           bignumberJs;
  lenderFee:              bignumberJs;
  takerFee:               bignumberJs;
  interestRate:           bignumberJs;
  interestPeriod:         bignumberJs;
  expirationTimestamp:    bignumberJs;
  callTimeLimit:          bignumberJs;
  maxDuration:            bignumberJs;
  salt:                   bignumberJs;
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
  principal:          bignumberJs;
  requiredDeposit:    bignumberJs;
  callTimeLimit:      bignumberJs;
  startTimestamp:     bignumberJs;
  callTimestamp:      bignumberJs;
  maxDuration:        bignumberJs;
  interestRate:       bignumberJs;
  interestPeriod:     bignumberJs;
}
