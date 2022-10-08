const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, waffle } = require("hardhat");

let primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911]

// calculates base^exponent % modulus
function powerMod(base, exponent, modulus) {
    if (modulus === 1) return 0;
    var result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1)  //odd number
            result = (result * base) % modulus;
        exponent = exponent >> 1; //divide by 2
        base = (base * base) % modulus;
    }
    return result;
}

describe("Wordle contract", function () {
    async function deployWordleFixture() {
        const wordleContract = await ethers.getContractFactory("Wordle");
        const [owner, addr1, addr2] = await ethers.getSigners();
        const instance = await wordleContract.deploy();
        await instance.deployed();

        return {wordleContract, instance, owner, addr1, addr2};
    }

    describe("Deployment", async function () {
        it("Should set the right owner", async function () {
            const {instance, owner} = await loadFixture(deployWordleFixture);

            expect(await instance.owner()).to.equal(owner.address);
        });
    });

    describe("Leaderboard", async function () {
       it("should set a leaderboard", async function () {

       });

       it("should be able to add rankings into the leaderboard", async function () {

       });
    });

    describe("Create new Wordle puzzle", async function () {
        it("should have new acculumator, modulus, and witnesses", async function () {

        });

        it("should reset attempts stored in the contract")
    });



    describe("Internal functions", async function () {
        describe("Fast Exp Mod function",  async function () {
            it("should give the correct result for expmod", async function () {
                const {instance} = await loadFixture(deployWordleFixture);

                const testSet = [
                    {
                        base: Math.floor(Math.random() * 256),
                        exp: primes[Math.floor(Math.random() * primes.length)],
                        mod: primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)]
                    },
                    {
                        base: Math.floor(Math.random() * 256),
                        exp: primes[Math.floor(Math.random() * primes.length)],
                        mod: primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)]
                    },
                    {
                        base: Math.floor(Math.random() * 256),
                        exp: primes[Math.floor(Math.random() * primes.length)],
                        mod: primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)]
                    },
                    {
                        base: Math.floor(Math.random() * 256),
                        exp: primes[Math.floor(Math.random() * primes.length)],
                        mod: primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)]
                    },
                ];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await instance.fastModExp(testSet[i].base, testSet[i].exp, testSet[i].mod))
                        .to.equal(powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod));
                }
            });
        });

        describe("IntToBinary function", async function () {
            it("should give the correct result", async function () {
                const {instance} = await loadFixture(deployWordleFixture);

                const testSet = [
                    3
                ];

                expect(await instance.intToBinary(testSet[0])).to.equal(testSet[0].toString(2).split(""));
            });
        });

        describe("Log2 ceiling function", async function () {
            it("should give the correct result for the ceiling of log2", async function() {
                const {instance} = await loadFixture(deployWordleFixture);

                const testSet = [20, 5, 1239, 652, 4097, 3, 551, 68, 90, 329, 11334];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await instance.log2ceil(testSet[i])).to.equal(Math.ceil(Math.log2(testSet[i])));
                }
            });
        });
    });
});