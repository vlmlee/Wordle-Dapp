const {
    letterToPrime,
    primes,
    calculateAccumulator,
    calculateWitnesses,
    onlyUnique
} = require('./helpers/wordle-helpers');

const { network, ethers, artifacts } = require('hardhat');

const WordleAddress = require('../frontend/src/contracts/contract-address.json');
const WordleABI = require('../frontend/src/contracts/WordleABI.json');
const wordBank = require('../frontend/src/helpers/wordBank.json');

require('dotenv').config();

async function createNewWordlePuzzle() {
    let provider, wallet;

    console.log(network.name);

    if (network.name === 'hardhat') {
        console.warn(
            'You are trying to deploy a contract to the Hardhat Network, which' +
                'gets automatically created and destroyed every time. Use the Hardhat' +
                " option '--network localhost'"
        );

        provider = new ethers.providers.JsonRpcProvider();
        // hardhat account #0
        wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);
    } else if (network.name === 'localhost') {
        provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
        // hardhat account #0
        wallet = new ethers.Wallet(`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`, provider);
    } else if (network.name === 'sepolia') {
        provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
        wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
    }

    const instance = new ethers.Contract(WordleAddress.address, WordleABI.abi, wallet);

    const solutionFromEnv = process.env.SOLUTION || 'rally';
    console.log('Solution: ', solutionFromEnv);

    if (solutionFromEnv.length !== 5) {
        console.error(new Error('Solution must be exactly 5 letters.'));
        process.exit(1);
    }

    if (!wordBank.includes(solutionFromEnv.toLowerCase())) {
        console.error(new Error('Solution must be an actual word.'));
        process.exit(1);
    }

    const lettersArr = solutionFromEnv.split('');

    const pos = lettersArr.map((letter, index) => {
        return letter.toLowerCase() + index;
    });
    const member = lettersArr.filter(onlyUnique).map(x => x + 5);

    const solution = [...pos, ...member];
    console.log(solution);

    const _primes = solution.map(letterPosition => {
        const [letter, position] = letterPosition.split('');
        return letterToPrime(letter, position);
    });
    console.log('Primes: ', _primes);

    const generator = Math.floor(2 ** 10 + Math.random() * 2 ** 16); // Possible to hit 1 or 0 here, so we add 2**10 as a floor
    console.log('Generator: ', generator);

    const _modulus =
        primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)];
    console.log('Modulus: ', _modulus);

    const _accumulator = calculateAccumulator(_primes, generator, _modulus);
    console.log('Accumulator: ', _accumulator);

    const witnesses = calculateWitnesses(_primes, generator, _modulus);
    console.log('Witnesses: ', witnesses);

    const createTx = await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses, {
        gasLimit: 10000000
    });
    const createTxReceipt = await createTx.wait();

    console.log(createTxReceipt);
}

createNewWordlePuzzle()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
