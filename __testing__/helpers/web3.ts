import Web3 from 'web3';
import bluebird from 'bluebird';

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.GANACHE_URL));

bluebird.promisifyAll(web3.eth);
web3.eth.defaultAccount = web3.eth.accounts[0];

export default web3;
