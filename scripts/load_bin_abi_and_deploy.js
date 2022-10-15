//load 'ethers' and 'fs'
const ethers = require('ethers');
const fs = require('fs');

require('dotenv').config();

//Read bin and abi file to object; names of the solcjs-generated files renamed
bytecode = fs.readFileSync('storage.bin').toString();
abi = JSON.parse(fs.readFileSync('storage.abi').toString());

//to create 'signer' object;here 'account'
const mnemonic = process.env.MNEMONIC // seed phrase for your Metamask account
const provider = new ethers.providers.WebSocketProvider(process.env.INFURA_URL + process.env.INFURA_API_KEY);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);

const myContract = new ethers.ContractFactory(abi, bytecode, account);

//Ussing async-await for deploy method
async function main() {
    // If your contract requires constructor args, you can specify them here
    const contract = await myContract.deploy();

    console.log(contract.address);
    console.log(contract.deployTransaction);
}

// main();