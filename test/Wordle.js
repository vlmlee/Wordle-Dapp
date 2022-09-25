const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Wordle contract", function () {
    async function deployWordleFixture() {
        const Wordle = await ethers.getContractFactory("Wordle");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const hardhatWordle = await Wordle.deploy();
        await hardhatWordle.deployed();

        return {Wordle, hardhatWordle, owner, addr1, addr2};
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const {hardhatWordle, owner} = await loadFixture(deployWordleFixture);

            expect(await hardhatWordle.owner()).to.equal(owner.address);
        });
    });

    describe("Transactions", function () {

    });
});