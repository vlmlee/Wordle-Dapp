# Decentralized Wordle

Come play with it live [here](https://master.dme99r4sotkse.amplifyapp.com/).

To deploy your own Wordle smart contract, create your own `.env` file and put in your Infura credentials:

```shell
INFURA_URL="https://sepolia.infura.io/v3/"
INFURA_API_KEY="<your-api-key>"
MNEMONIC="<your-mnemonic>"
PRIVATE_KEY="<your-private-key>"
ADDRESS="<your-wallet-address>"
```

Then run:

```shell
npm run deploy-wordle-and-create-puzzle-on-sepolia
```

To deploy the smart contract on the Sepolia testnet and to create a new Wordle puzzle. The console will print out the deployer's wallet 
address and the contract's deployed address when the script finishes.

To create a new Wordle puzzle, run:

```shell
npm run create-new-wordle-sepolia
```

You can change the puzzle solution in `scripts/create-new-wordle-puzzle.js` before you run the npm script.