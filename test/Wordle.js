const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, waffle } = require("hardhat");

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

    describe("Internal functions", async function () {

        describe("Fast Exp Mod function",  async function () {

        });

        describe("Log2 ceiling function", function () {
            it("should give the correct result for the ceiling of log2", async function() {
                const {hardhatWordle, owner} = await loadFixture(deployWordleFixture);

                const testSet = [20, 5, 1239, 652, 4097, 3, 551, 68, 90, 329, 11334];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await hardhatWordle.log2ceil(testSet[i])).to.equal(Math.ceil(Math.log2(testSet[i])));
                }
            });
        });
    });
});