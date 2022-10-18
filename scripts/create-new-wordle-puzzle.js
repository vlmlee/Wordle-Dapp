const { letterToPrime, primes, calculateAccumulator, calculateWitnesses } = require('./helpers/wordle-helpers');

const { network, ethers, artifacts } = require('hardhat');

const WordleAddress = require('../frontend/src/contracts/contract-address.json');
const WordleABI = require('../frontend/src/contracts/WordleABI.json');

require('dotenv').config();

async function createNewWordlePuzzle() {
    const provider = new ethers.providers.JsonRpcProvider(`${process.env.INFURA_URL + process.env.INFURA_API_KEY}`);
    // hardhat account #0
    const wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);
    const instance = new ethers.Contract('0x4333141C15060Fe9e763655849E31aB6E96C80AA', WordleABI.abi, wallet);

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

    const createTx = await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses, {
        gasLimit: 10000000
    });
    const createTxReceipt = await createTx.wait();

    console.log(createTxReceipt);
}

createNewWordlePuzzle()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
