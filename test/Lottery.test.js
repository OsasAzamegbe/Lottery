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

    it('Player can enter lottery', async () => {
        const player1 = accounts[1];

        await lotteryContract.methods.enterLottery()
            .send({ from: player1, value: web3.utils.toWei('0.01', 'ether') });
        const actualPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(1, actualPlayers.length);
        assert.equal(player1, actualPlayers[0]);
    });

    it('Manager can enter lottery', async () => {
        await lotteryContract.methods.enterLottery()
            .send({ from: managerAccount, value: web3.utils.toWei('0.01', 'ether') });
        const actualPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(1, actualPlayers.length);
        assert.equal(managerAccount, actualPlayers[0]);
    });

    it('Multiple players can enter lottery', async () => {
        const [player1, player2, player3] = accounts;

        await lotteryContract.methods.enterLottery()
            .send({ from: player1, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.enterLottery()
            .send({ from: player2, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.enterLottery()
            .send({ from: player3, value: web3.utils.toWei('0.01', 'ether') });

        const actualPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(3, actualPlayers.length);
        assert.equal(player1, actualPlayers[0]);
        assert.equal(player2, actualPlayers[1]);
        assert.equal(player3, actualPlayers[2]);
    });

    it('Fails to enter lottery if player sends zero wei', async () => {
        const player1 = accounts[1];

        try {
            await lotteryContract.methods.enterLottery()
                .send({ from: player1, value: 0 });

            assert(false);
        } catch (error) {
            assert(error);
        }

        const actualPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(0, actualPlayers.length);
    });

    it('Fails to enter lottery if player does not send enough wei', async () => {
        const player1 = accounts[1];

        try {
            await lotteryContract.methods.enterLottery()
                .send({ from: player1, value: web3.utils.toWei('0.009', 'ether') });

            assert(false);
        } catch (error) {
            assert(error);
        }

        const actualPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(0, actualPlayers.length);
    });

    it('Manager can call pickWinner', async () => {
        const player1 = accounts[1];

        await lotteryContract.methods.enterLottery()
            .send({ from: player1, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.pickWinner()
            .send({ from: managerAccount });
    });

    it('Non-manager cannot call pickWinner', async () => {
        const randomAccount = accounts[1];
        assert.notEqual(managerAccount, randomAccount);

        await lotteryContract.methods.enterLottery()
            .send({ from: randomAccount, value: web3.utils.toWei('0.01', 'ether') });

        try {
            await lotteryContract.methods.pickWinner()
                .send({ from: randomAccount });

            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('Contract players reset after pickWinner is called', async () => {
        const player = accounts[1];

        await lotteryContract.methods.enterLottery()
            .send({ from: player, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.pickWinner()
            .send({ from: managerAccount });
        const lotteryPlayers = await lotteryContract.methods.getPlayers().call();

        assert.equal(0, lotteryPlayers.length);
    });

    it('Winner is paid after pickWinner is called', async () => {
        const player = accounts[1];
        const lotteryPot = web3.utils.toWei('1', 'ether');

        await lotteryContract.methods.enterLottery()
            .send({ from: player, value: lotteryPot });
        const initialBalance = await web3.eth.getBalance(player);
        await lotteryContract.methods.pickWinner()
            .send({ from: managerAccount });
        const balanceChange = await web3.eth.getBalance(player) - initialBalance;

        assert(balanceChange > lotteryPot * 0.95); //reduce by 5% for potential gas fees while playing lottery
    });

    it('Lottery balance equals total money sent by players', async () => {
        const [player1, player2, player3] = accounts;

        await lotteryContract.methods.enterLottery()
            .send({ from: player1, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.enterLottery()
            .send({ from: player2, value: web3.utils.toWei('0.01', 'ether') });
        await lotteryContract.methods.enterLottery()
            .send({ from: player3, value: web3.utils.toWei('0.01', 'ether') });

        const lotteryBalance = await web3.eth.getBalance(lotteryContract.options.address);

        assert.equal(web3.utils.toWei('0.03', 'ether'), lotteryBalance);
    });
})