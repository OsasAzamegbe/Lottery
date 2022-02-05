const path = require('path');
const fs = require('fs');
const solc = require('solc');


const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const sourceCode = fs.readFileSync(lotteryPath, 'utf-8');
const compilerInput = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': {
            content: sourceCode,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const compiledCode = JSON.parse(solc.compile(JSON.stringify(compilerInput)));

module.exports = compiledCode.contracts['Lottery.sol'].Lottery;