const { abi, evm } = require('../compile');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');


const web3 = new Web3(ganache.provider());
let lotteryContract;
let accounts;
let managerAccount;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    managerAccount = accounts[0];

    lotteryContract = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: managerAccount, gas: '1000000' });
});

describe('LotteryTest', () => {
    it('Lottery contract is deployed', () => {
        assert.ok(lotteryContract.options.address);
    });

    it('Manager account is initiated', async () => {
        const lotteryManagerAccount = await lotteryContract.methods.m_manager().call();
        assert.equal(managerAccount, lotteryManagerAccount);
    });
})