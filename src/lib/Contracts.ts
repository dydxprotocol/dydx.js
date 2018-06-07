import { Margin as MarginContract } from '@dydxprotocol/protocol';
import { Proxy as ProxyContract } from '@dydxprotocol/protocol';
import { ERC20ShortCreator as ERC20ShortCreatorContract } from '@dydxprotocol/protocol';
import { ERC20LongCreator as ERC20LongCreatorContract } from '@dydxprotocol/protocol';
import { SharedLoan as SharedLoanContract } from '@dydxprotocol/protocol';
import contract from 'truffle-contract';
import { setupContract } from './Helpers';

const Margin = contract(MarginContract);
const Proxy = contract(ProxyContract);
const ERC20ShortCreator = contract(ERC20ShortCreatorContract);
const ERC20LongCreator = contract(ERC20LongCreatorContract);
const SharedLoan = contract(SharedLoanContract);

export class Contracts {
    public margin;
    public proxy;
    public erc20ShortCreator;
    public erc20LongCreator;
    public sharedLoan;

    constructor(
        provider: any,
        networkId: number
    ) {
        this.connectContracts(provider, networkId).catch( e => console.error(e) );
    }

    public async setProvider(
        provider: any,
        networkId: number
    ): Promise<any> {
        return this.connectContracts(provider, networkId);
    }

    private async connectContracts(
        provider: any,
        networkId: number
    ) {
        setupContract(Margin, provider, networkId);
        setupContract(Proxy, provider, networkId);
        setupContract(ERC20ShortCreator, provider, networkId);
        setupContract(ERC20LongCreator, provider, networkId);
        setupContract(SharedLoan, provider, networkId);

        const [
            margin,
            proxy,
            erc20ShortCreator,
            erc20LongCreator,
            sharedLoan
        ] = await Promise.all([
            Margin.deployed(),
            Proxy.deployed(),
            ERC20ShortCreator.deployed(),
            ERC20LongCreator.deployed(),
            SharedLoan.deployed()
        ]);

        this.margin = margin;
        this.proxy = proxy;
        this.erc20ShortCreator = erc20ShortCreator;
        this.erc20LongCreator = erc20LongCreator;
        this.sharedLoan = sharedLoan;
    }
}
