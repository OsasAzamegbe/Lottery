const { abi, evm } = require('./compile');

const Web3 = require('web3');
const HdWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const getAccountProvider = () => {
    return new HdWalletProvider(process.env.ACCOUNT_MNEMONIC, process.env.INFURA_RINKEBY_ENDPOINT);
}

const deploy = async () => {
    const accountProvider = getAccountProvider();
    const web3 = new Web3(accountProvider);

    console.log('Getting accounts from Provider...');
    const accounts = await web3.eth.getAccounts();

    console.log('Deploying Lottery contract with account:', accounts[0]);
    const txnObj = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object})
        .send({from: accounts[0], gas: '1000000'});

    console.log('Lottery contract with ABI:', abi);
    console.log('Lottery contract deployed to address:', txnObj.options.address)

    accountProvider.engine.stop();
}

deploy();