# Decentralized Wordle

Come play with it live [here](https://master.dme99r4sotkse.amplifyapp.com/).

## Deploying to Sepolia Testnet with Infura

First, create a `.env` file and put in your Infura credentials (make sure to `.gitignore` this file):

```shell
INFURA_URL="https://sepolia.infura.io/v3/"
INFURA_API_KEY="<your-api-key>"
MNEMONIC="<your-mnemonic>"
PRIVATE_KEY="<your-private-key>"
ADDRESS="<your-wallet-address>"
SOLUTION="<your-wordle-solution>"
```

Then to deploy the smart contract onto the Sepolia testnet, run:

```shell
npm run deploy-wordle-and-create-puzzle-on-sepolia
```

When the script finishes, the console will print out the deployer's wallet address and the contract's deployed address. If you want to create a new Wordle puzzle, edit the `$SOLUTION` environment variable and then run:

```shell
npm run create-new-wordle-sepolia
```

To interact with the smart contract, you'll need a frontend. So in the command line, run:

```shell
cd frontend
npm install
npm start
```

And that should spin up a React app that connects to your deployed contract. Look up the smart contract on [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/) to make sure it's there, and you're set!

## Running locally

You can also run this project locally with the hardhat test node with the commands:

```shell
npx hardhat node
npm run deploy-local
npm run create-new-wordle-local
```

## Testing

To run the test suite and check what functionality has been tested, run:

```shell
npm test
```

The unit tests are not exhaustive and the smart contract has not been audited so please **do not use this in production**.