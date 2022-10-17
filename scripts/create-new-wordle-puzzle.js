const {
    letterToPrime,
    primes,
    calculateAccumulator,
    calculateWitnesses
} = require('../frontend/src/helpers/wordle-helpers');

const { network, ethers, artifacts } = require('hardhat');

const WordleAddress = require('../frontend/src/contracts/contract-address.json');
const WordleABI = require('../frontend/src/contracts/WordleABI.json');

require('dotenv').config();

async function createNewWordlePuzzle() {
    const provider = new ethers.providers.JsonRpcProvider();
    // hardhat account #0
    const wallet = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    const instance = new ethers.Contract(WordleAddress.address, WordleABI.abi, wallet);

    const solution = ['r0', 'A1', 'l2', 'L3', 'y4', 'r5', 'a5', 'l5', 'y5'];
    const _primes = solution.map((letterPosition) => {
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

    const createTx = await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses);
    const createTxReceipt = await createTx.wait();

    console.log(createTxReceipt);
}

createNewWordlePuzzle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
