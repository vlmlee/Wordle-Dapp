// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require('path');
const { network, ethers, artifacts } = require('hardhat');

async function main() {
    // This is just a convenience check
    if (network.name === 'hardhat') {
        console.warn(
            'You are trying to deploy a contract to the Hardhat Network, which' +
                'gets automatically created and destroyed every time. Use the Hardhat' +
                " option '--network localhost'"
        );
    }

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log('Deploying the contracts with the account:', await deployer.getAddress());

    const WordleFactory = await ethers.getContractFactory('Wordle');
    const WordleContract = await WordleFactory.deploy();
    await WordleContract.deployed();

    console.log('Contract address:', WordleContract.address);

    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles(WordleContract);
}

function saveFrontendFiles(contract) {
    const fs = require('fs');
    const contractsDir = path.join(__dirname, '..', 'frontend', 'src', 'contracts');

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        path.join(contractsDir, 'contract-address.json'),
        JSON.stringify({ address: contract.address }, undefined, 2)
    );

    const WordleArtifact = artifacts.readArtifactSync('Wordle');

    fs.writeFileSync(path.join(contractsDir, 'WordleABI.json'), JSON.stringify(WordleArtifact, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
