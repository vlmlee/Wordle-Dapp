const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, waffle } = require("hardhat");
const {BigNumber} = require("ethers");

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

    describe("Withdrawing funds", async function () {
       it("should be able to withdraw funds if you are the owner", async function () {

       });

       it("should not allow anyone other than the owner to withdraw funds", async function () {

       });

       it("should revert if the contract has no funds in its balance", async function () {

       });

       it("should emit WithdrawalSuccessful event when the owner successfully withdraws the balance", async function () {

       });
    });

    describe("Leaderboard", async function () {
       it("should set a leaderboard", async function () {

       });

       it("should be able to add rankings into the leaderboard", async function () {

       });

       it("should allow the contract to fund the leaderboard", async function () {

       });
    });

    describe("Create new Wordle puzzle", async function () {
        it("should be able to create a new puzzle with a new acculumator, modulus, and witnesses", async function () {

        });

        it("should reset the attempts stored in the contract", async function () {

        });

        it("should update the Wordle puzzle number", async function () {

        });

        it("should only allow the contract owner to create a new Wordle", async function () {

        });
    });

    describe("Attempts on a Wordle puzzle", async function () {
        it("should verify the membership of a guess in the solution", async function () {

        });

        it("should verify the position of a guess in the solution", async function () {

        });

        it("should verify that the guess is not in the solution", async function () {

        });

        it("should verify that the guess is in the solution but in the wrong position", async function () {

        });

        it("should emit PlayerMadeAttempt even when a player completes an attempt", async function () {

        });

        it("should increase a player's attempt count after they complete an attempt", async function () {

        });

        it("should return an array of answers pertaining to each guess supplied", async function () {

        });

        it("should return a boolean value of whether the Wordle was solved or not", async function () {

        });
    });

    describe("Solving a Wordle puzzle", async function () {
        it("should be able to verify that a Wordle was solved by a player", async function () {

        });

        it("should emit PlayerSolvedWordle event when the player has solved the Wordle", async function () {

        });

        it("should revert if a player has already solved the Wordle", async function () {

        });

        it("should show the number of Wordles solved by a player has increased", async function () {

        });
    });

    describe("Helper functions", async function () {
       describe("CheckIfSolved", async function () {
           it("should return true if all elements in the array of 2 element arrays are true", async function () {

           });

           it("should return false if at least one element is false", async function () {

           });
       });

       describe("VerifyMembership", async function () {

       });

       describe("VerifyPosition", async function () {

       });
    });

    describe("Math functions", async function () {
        describe("Fast Exp Mod function / divide and conquer",  async function () {
            it("should give the correct result for modular exponentiation of large numbers", async function () {
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
                    console.log(testSet[i]);
                    const fastMod = await instance.fastModExp(testSet[i].base, testSet[i].exp, testSet[i].mod);
                    const pMod = powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                    console.log("Fast Mod: ", fastMod);
                    console.log("Power Mod: ", pMod);
                    expect(fastMod.toNumber()).to.equal(pMod);
                }
            });
        });

        describe("IntToBinary function", async function () {
            it("should turn an integer into a small endian binary array representation", async function () {
                const {instance} = await loadFixture(deployWordleFixture);

                const testSet = [
                    30,
                    1234,
                    44,
                    3,
                    986,
                    12,
                    31234,
                    221,
                    84,
                    7639,
                    1294,
                    213,
                    11,
                    298
                ];
                testSet.forEach(async (n) => {
                    expect(await instance.intToBinary(n)).to.equal(n.toString(2).split("").map(x => +x));
                });
            });

            describe("Divide and conquer memo", async function () {
                it("should give the correct mod exp of an binary array for powers of two", async function () {
                    const {instance} = await loadFixture(deployWordleFixture);

                    const testSet = [
                        {
                            base: 21,
                            exponent: 34,
                            modulus: 65,
                            solution: [
                                BigNumber.from("1"), // 21^32 mod 65
                                BigNumber.from("1"), // 21^16 mod 65
                                BigNumber.from("1"), // 21^8 mod 65
                                BigNumber.from("1"), // 21^4 mod 65
                                BigNumber.from("51"), // 21^2 mod 65
                                BigNumber.from("21") // 21^1 mod 65
                            ],
                        },
                        {
                            base: 44,
                            exponent: 214,
                            modulus: 99,
                            solution: [
                                BigNumber.from("55"), // 44^128 mod 99
                                BigNumber.from("55"), // 44^64 mod 99
                                BigNumber.from("55"), // 44^32 mod 99
                                BigNumber.from("55"), // 44^16 mod 99
                                BigNumber.from("55"), // 44^8 mod 99
                                BigNumber.from("55"), // 44^4 mod 99
                                BigNumber.from("55"), // 44^2 mod 99
                                BigNumber.from("44") // 44^1 mod 99
                            ]
                        }
                    ];

                    for (let i = 0; i < testSet.length; i++) {
                        const arrayToTest = await instance.intToBinary(testSet[i].exponent);
                        const s = await instance.createMemoArrayOfPowersOfTwo(testSet[i].base, arrayToTest, testSet[i].modulus);
                        expect(s).to.deep.equal(testSet[i].solution);
                    }
                });
            });

            describe("Power mod", async function () {
               it("should give the correct result for modular exponentiation", async function () {
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
                       console.log(testSet[i]);
                       const pMod1 = await instance.powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                       const pMod2 = powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                       console.log("Power Mod - Solidity: ", pMod1);
                       console.log("Power Mod - JS: ", pMod1);
                       expect(pMod1.toNumber()).to.equal(pMod2);
                   }
               });
            });
        });

        describe("Log2ceil function", async function () {
            it("should give the correct result for the ceiling of log base 2", async function() {
                const {instance} = await loadFixture(deployWordleFixture);

                const testSet = [20, 5, 1239, 652, 4097, 3, 551, 68, 90, 329, 11334];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await instance.log2ceil(testSet[i])).to.equal(Math.ceil(Math.log2(testSet[i])));
                }
            });
        });
    });
});