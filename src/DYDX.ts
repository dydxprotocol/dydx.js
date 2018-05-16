import Web3 from 'web3';
import { LoanHelper } from './modules/LoanHelper';
import { ZeroExHelper } from './modules/ZeroExHelper';
import { Margin } from './modules/Margin';
import { TokenHelper } from './modules/TokenHelper';
import { Contracts } from './lib/Contracts';

export class DYDX {
    public margin: Margin;
    public loanOffering: LoanHelper;
    public zeroEx: ZeroExHelper;
    public token: TokenHelper;

    public currentProvider;

    private contracts: Contracts;

    constructor(
        provider
    ) {
        this.currentProvider = provider;

        const web3 = new Web3(provider);
        this.contracts = new Contracts(provider);

        this.loanOffering = new LoanHelper(web3, this.contracts);
        this.margin = new Margin(this.contracts);
        this.zeroEx = new ZeroExHelper(web3);
        this.token = new TokenHelper(provider, this.contracts);
    }

    public setProvider(provider) {
        this.currentProvider = provider;
        this.contracts.setProvider(provider);
        this.token.setProvider(provider);
    }
}
