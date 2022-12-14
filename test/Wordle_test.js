const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');

const {
    primes,
    letterToPrime,
    calculateAccumulator,
    calculateWitnesses,
    powerMod,
    convertLetterAndPositionToPrimes
} = require('../scripts/helpers/wordle-helpers');

describe('Wordle contract', function () {
    async function deployWordleFixture() {
        const wordleContract = await ethers.getContractFactory('Wordle');
        const [owner, addr1, addr2] = await ethers.getSigners();
        const instance = await wordleContract.deploy();
        await instance.deployed();

        return { wordleContract, instance, owner, addr1, addr2 };
    }

    async function deployWordleWithPuzzleSet() {
        const wordleContract = await ethers.getContractFactory('Wordle');
        const [owner, addr1, addr2] = await ethers.getSigners();
        const instance = await wordleContract.deploy();
        await instance.deployed();

        const solution = ['r0', 'A1', 'l2', 'L3', 'y4', 'r5', 'a5', 'l5', 'y5'];
        const _primes = solution.map(letterPosition => {
            const [letter, position] = letterPosition.split('');
            return letterToPrime(letter, position);
        });
        // console.log("Primes: ", _primes);

        const generator = Math.floor(2 ** 10 + Math.random() * 2 ** 16); // Possible to hit 1 or 0 here, so we add 2**10 as a floor
        // console.log("Generator: ", generator);
        const _modulus =
            primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)];
        // console.log("Modulus: ", _modulus);

        const _accumulator = calculateAccumulator(_primes, generator, _modulus);
        // console.log("Accumulator: ", _accumulator);

        const witnesses = calculateWitnesses(_primes, generator, _modulus);
        // console.log("Witnesses: ", witnesses);

        await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses);

        return { wordleContract, instance, owner, addr1, addr2 };
    }

    describe('Deployment', async function () {
        it('Should set the right owner', async function () {
            const { instance, owner } = await loadFixture(deployWordleFixture);

            expect(await instance.owner()).to.equal(owner.address);
        });
    });

    describe('Withdrawing funds', async function () {
        it('should be able to withdraw funds if you are the owner with a WithdrawalSuccessful event emitted', async function () {
            const { instance, owner } = await loadFixture(deployWordleFixture);

            const amount = ethers.utils.parseEther('1.0');

            await owner.sendTransaction({ to: instance.address, value: amount });

            const provider = waffle.provider;
            const balance = await provider.getBalance(instance.address);

            expect(balance).to.equal(amount);

            await expect(instance.withdraw()).to.emit(instance, 'WithdrawalSuccessful').withArgs(amount);

            expect(await provider.getBalance(instance.address), 'Balance should be 0').to.equal(BigNumber.from('0'));
        });

        it('should not allow anyone other than the owner to withdraw funds', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleFixture);

            await expect(instance.connect(addr1).withdraw()).to.be.revertedWithCustomError(
                instance,
                'PlayerIsNotOwner'
            );
        });

        it('should revert if the contract has no funds in its balance', async function () {
            const { instance } = await loadFixture(deployWordleFixture);

            await expect(instance.withdraw()).to.be.revertedWithCustomError(instance, 'WithdrawalMustBeNonZero');
        });
    });

    describe('Leaderboard', async function () {
        it('should set a leaderboard', async function () {});

        it('should be able to add rankings into the leaderboard', async function () {});

        it('should allow the contract to fund the leaderboard', async function () {});
    });

    describe('Create new Wordle puzzle', async function () {
        it('should be able to create a new puzzle with a new accumulator, modulus, and witnesses', async function () {
            const { instance } = await loadFixture(deployWordleFixture);

            const mockPuzzle = {
                accumulator: 21,
                modulus: 234,
                witnesses: [1, 2, 3, 4, 5, 1, 1, 1, 1]
            };

            await expect(
                instance.createNewWordlePuzzle(mockPuzzle.accumulator, mockPuzzle.modulus, mockPuzzle.witnesses)
            ).to.emit(instance, 'CreatedNewWordlePuzzle');
        });

        it('should reset the attempts stored in the contract', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleFixture);

            const solution = ['r0', 'A1', 'l2', 'L3', 'y4', 'r5', 'a5', 'l5', 'y5'];
            const _primes = solution.map(letterPosition => {
                const [letter, position] = letterPosition.split('');
                return letterToPrime(letter, position);
            });
            // console.log("Primes: ", _primes);

            const generator = Math.floor(2 ** 10 + Math.random() * 2 ** 16); // Possible to hit 1 or 0 here, so we add 2**10 as a floor
            // console.log("Generator: ", generator);
            const _modulus =
                primes[Math.floor(Math.random() * primes.length)] * primes[Math.floor(Math.random() * primes.length)];
            // console.log("Modulus: ", _modulus);

            const _accumulator = calculateAccumulator(_primes, generator, _modulus);
            // console.log("Accumulator: ", _accumulator);

            const witnesses = calculateWitnesses(_primes, generator, _modulus);
            // console.log("Witnesses: ", witnesses);

            await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses);

            let wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);
            let attempts = 0;
            expect(await instance.playerAttempts(wordlePuzzleNo, addr1.address), '').to.equal(attempts);

            const correctGuess = convertLetterAndPositionToPrimes(['r0', 'a1', 'l2', 'l3', 'y4']);

            await instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') });

            expect(
                await instance.playerPuzzleNumberSolved(addr1.address, wordlePuzzleNo),
                'Wordle puzzle should have been solved'
            ).to.equal(true);
            expect(
                await instance.playerAttempts(wordlePuzzleNo, addr1.address),
                'Attempt should have incremented'
            ).to.equal(++attempts);

            await instance.resetAllAttempts();
            wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(
                await instance.playerAttempts(wordlePuzzleNo, addr1.address),
                'Puzzle should have reset attempts'
            ).to.equal(0);

            await instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') });
            expect(
                await instance.playerPuzzleNumberSolved(addr1.address, wordlePuzzleNo),
                'Wordle puzzle should have been solved'
            ).to.equal(true);
            expect(
                await instance.playerAttempts(wordlePuzzleNo, addr1.address),
                'Attempt should have reset and now equal 1'
            ).to.equal(1);
        });

        it('should update the Wordle puzzle number', async function () {
            const { instance } = await loadFixture(deployWordleFixture);

            await instance.resetAllAttempts();

            expect(await instance.wordlePuzzleNo(), 'Puzzle number should be 1').to.equal(1);
        });

        it('should only allow the contract owner to create a new Wordle', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleFixture);

            const mockPuzzle = {
                accumulator: 21,
                modulus: 234,
                witnesses: [1, 2, 3, 4, 5, 1, 1, 1, 1]
            };

            await expect(
                instance
                    .connect(addr1)
                    .createNewWordlePuzzle(mockPuzzle.accumulator, mockPuzzle.modulus, mockPuzzle.witnesses)
            ).to.be.revertedWithCustomError(instance, 'PlayerIsNotOwner');
        });

        it('should be able to reset all current attempts made by players', async function () {
            const { instance, owner, addr1, addr2 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const guesses = convertLetterAndPositionToPrimes(['a0', 'g1', 'r2', 'e3', 'e4']);
            // console.log("Guesses: ", guesses);

            await instance.makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([owner.address]);

            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address
            ]);

            expect(
                await instance.getCurrentAttempts(owner.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([guesses]);
            expect(
                await instance.getCurrentAttempts(addr1.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([guesses]);

            const mockPuzzle = {
                accumulator: 21,
                modulus: 234,
                witnesses: [1, 2, 3, 4, 5, 1, 1, 1, 1]
            };

            await expect(
                instance.createNewWordlePuzzle(mockPuzzle.accumulator, mockPuzzle.modulus, mockPuzzle.witnesses)
            ).to.emit(instance, 'CreatedNewWordlePuzzle');

            expect(
                await instance.getCurrentAttempts(owner.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([]);
            expect(
                await instance.getCurrentAttempts(addr1.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([]);

            await instance.makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });

            expect(
                await instance.getCurrentAttempts(owner.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([guesses]);
            expect(
                await instance.getCurrentAttempts(addr1.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([guesses, guesses]);
        });
    });

    describe('Attempts on a Wordle puzzle', async function () {
        it("should remember a player's previous attempts", async function () {
            const { instance, owner } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const guesses = convertLetterAndPositionToPrimes(['a0', 'g1', 'r2', 'e3', 'e4']);
            // console.log("Guesses: ", guesses);

            await instance.makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(
                await instance.getCurrentAttempts(owner.address),
                'Stored guesses did not match expected test guess'
            ).to.deep.equal([guesses]);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);

            await instance.makeAttempt(newGuess, { value: ethers.utils.parseEther('0.0007') });
            expect(
                await instance.getCurrentAttempts(owner.address),
                'Stored guesses did not match expected test guesses'
            ).to.deep.equal([guesses, newGuess]);
        });

        it('should remember past players who have attempted to solve the Wordle', async function () {
            const { instance, owner, addr1, addr2 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const guesses = convertLetterAndPositionToPrimes(['a0', 'g1', 'r2', 'e3', 'e4']);
            // console.log("Guesses: ", guesses);

            await instance.makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([owner.address]);

            await instance.makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([owner.address]);

            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address
            ]);

            await instance.connect(addr2).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address,
                addr2.address
            ]);

            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address,
                addr2.address
            ]);

            const mockPuzzle = {
                accumulator: 21,
                modulus: 234,
                witnesses: [1, 2, 3, 4, 5, 1, 1, 1, 1]
            };

            await expect(
                instance.createNewWordlePuzzle(mockPuzzle.accumulator, mockPuzzle.modulus, mockPuzzle.witnesses)
            ).to.emit(instance, 'CreatedNewWordlePuzzle');

            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address,
                addr2.address
            ]);

            await instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0.0007') });
            expect(await instance.getPlayers(), 'Stored players did not match expected').to.deep.equal([
                owner.address,
                addr1.address,
                addr2.address
            ]);
        });

        it('should verify the membership of a guess in the solution', async function () {
            const { instance } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const guesses = convertLetterAndPositionToPrimes(['a0', 'g1', 'r2', 'e3', 'e4']);
            // console.log("Guesses: ", guesses);

            const attemptTx = await instance.callStatic.makeAttempt(guesses, {
                value: ethers.utils.parseEther('0.0007')
            });
            // console.log(attemptTx);

            expect(attemptTx.answer, 'Returned answer did not match expected answer').to.deep.equal([
                false,
                false,
                false,
                false,
                false, // none of the letters are in the right position
                true,
                false,
                true,
                false // 'a' is in solution, 'g' is not in solution, 'r' is in solution, 'e' is not in solution
            ]);

            expect(attemptTx.isSolved, 'Answer should not be solved yet').to.equal(false); // Is not solved yet.
        });

        it('should verify the position of a guess in the solution', async function () {
            const { instance } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);
            // console.log("Guesses: ", newGuess);

            const secondAttempt = await instance.callStatic.makeAttempt(newGuess, {
                value: ethers.utils.parseEther('0.0007')
            });
            // console.log(secondAttempt);

            expect(secondAttempt.answer, 'Returned answer did not equal expected answer').to.deep.equal([
                true,
                false,
                false,
                true,
                false, // 'r' and 'l' are in the right position
                true,
                false,
                true,
                true,
                false // 'r' is in solution, 'e' is not in solution, 'a' is in solution, 'l' is in solution, 's' is not in solution
            ]);

            expect(secondAttempt.isSolved, 'Second attempt should not be solved yet').to.equal(false); // Is not solved yet.
        });

        it('should emit PlayerMadeAttempt even when a player completes an attempt', async function () {
            const { instance, owner } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);
            // console.log("Guesses: ", newGuess);

            await expect(instance.makeAttempt(newGuess, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    1,
                    wordlePuzzleNo,
                    [true, false, false, true, false, true, false, true, true, false],
                    false
                );
        });

        it("should increase a player's attempt count after they complete an attempt", async function () {
            const { instance, owner } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            let attempts = 0;
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);
            // console.log("Guesses: ", newGuess);

            await expect(instance.makeAttempt(newGuess, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, false, false, true, false, true, false, true, true, false],
                    false
                );

            expect(
                await instance.playerAttempts(wordlePuzzleNo, owner.address),
                'Number of attempts does not equal expected value'
            ).to.equal(attempts);

            const attempt = convertLetterAndPositionToPrimes(['r0', 'a1', 'i2', 'l3', 's4']);

            await expect(instance.makeAttempt(attempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );

            expect(
                await instance.playerAttempts(wordlePuzzleNo, owner.address),
                'Number of attempts does not equal expected value'
            ).to.equal(attempts);
        });

        it('should revert with PlayerMustPayFeeToPlay if the player does not cover the fee', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const guesses = convertLetterAndPositionToPrimes(['a0', 'g1', 'r2', 'e3', 'e4']);

            await expect(
                instance.connect(addr1).makeAttempt(guesses, { value: ethers.utils.parseEther('0') })
            ).to.be.revertedWithCustomError(instance, 'PlayerMustPayFeeToPlay');
        });

        it('should revert with PlayerHasMadeTooManyAttempts if the player attempts the puzzle more times than the allowed limit', async function () {
            const { instance, owner } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            let attempts = 0;
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);
            // console.log("Guesses: ", newGuess);

            await expect(instance.makeAttempt(newGuess, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, false, false, true, false, true, false, true, true, false],
                    false
                );
            expect(
                await instance.playerAttempts(wordlePuzzleNo, owner.address),
                'Number of attempts does not equal expected value'
            ).to.equal(attempts);

            const secondAttempt = convertLetterAndPositionToPrimes(['r0', 'a1', 'i2', 'l3', 's4']);

            await expect(instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );
            expect(await instance.playerAttempts(wordlePuzzleNo, owner.address)).to.equal(attempts);

            await expect(instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );
            expect(await instance.playerAttempts(wordlePuzzleNo, owner.address)).to.equal(attempts);

            await expect(instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );
            expect(await instance.playerAttempts(wordlePuzzleNo, owner.address)).to.equal(attempts);

            await expect(instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );
            expect(await instance.playerAttempts(wordlePuzzleNo, owner.address)).to.equal(attempts);

            await expect(instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') }))
                .to.emit(instance, 'PlayerMadeAttempt')
                .withArgs(
                    owner.address,
                    ++attempts,
                    wordlePuzzleNo,
                    [true, true, false, true, false, true, true, false, true, false],
                    false
                );
            expect(await instance.playerAttempts(wordlePuzzleNo, owner.address)).to.equal(attempts);

            await expect(
                instance.makeAttempt(secondAttempt, { value: ethers.utils.parseEther('0.0007') })
            ).to.be.revertedWithCustomError(instance, 'PlayerHasMadeTooManyAttempts');
        });
    });

    describe('Solving a Wordle puzzle', async function () {
        it('should be able to verify that a Wordle was solved by a player', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const newGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);
            // console.log("Guesses: ", newGuess);

            await instance.connect(addr1).makeAttempt(newGuess, { value: ethers.utils.parseEther('0.0007') }); // actual

            // const attempt = await instance.callStatic.makeAttempt(newGuess, {value: ethers.utils.parseEther("0.0007")}); // mocked
            // expect(attempt.answer, "Returned answer did not equal expected answer").to.deep.equal(
            //     [
            //         true, false, false, true, false, // 'r' and 'l' are in the right position
            //         true, false, true, true, false // 'r' is in solution, 'e' is not in solution, 'a' is in solution, 'l' is in solution, 's' is not in solution
            //     ]
            // );
            //
            // expect(attempt.isSolved, "Puzzle should not be solved yet").to.equal(false); // Is not solved yet.
            expect(await instance.playerPuzzleNumberSolved(addr1.address, wordlePuzzleNo)).to.equal(false);

            const correctGuess = convertLetterAndPositionToPrimes(['r0', 'a1', 'l2', 'l3', 'y4']);

            await instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') });

            // const secondAttempt = await instance.callStatic.makeAttempt(correctGuess, {from: addr1.address, value: ethers.utils.parseEther("0.0007")});
            // expect(secondAttempt.answer).to.deep.equal(
            //     [
            //         true, true, true, true, true,
            //         true, true, true, true
            //     ]
            // );
            //
            // expect(secondAttempt.isSolved).to.equal(true);
            expect(
                await instance.playerPuzzleNumberSolved(addr1.address, wordlePuzzleNo),
                'Wordle puzzle should have been solved'
            ).to.equal(true);
        });

        it('should emit PlayerSolvedWordle event when the player has solved the Wordle', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const correctGuess = convertLetterAndPositionToPrimes(['r0', 'a1', 'l2', 'l3', 'y4']);

            await expect(
                instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') })
            ).to.emit(instance, 'PlayerSolvedWordle');

            expect(
                await instance.playerPuzzleNumberSolved(addr1.address, wordlePuzzleNo),
                'Wordle puzzle should have been solved'
            ).to.equal(true);
        });

        it('should revert if a player attempts to solve an already solved Wordle puzzle', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);

            const correctGuess = convertLetterAndPositionToPrimes(['r0', 'a1', 'l2', 'l3', 'y4']);

            await expect(
                instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') })
            ).to.emit(instance, 'PlayerSolvedWordle');

            const anyGuess = convertLetterAndPositionToPrimes(['r0', 'e1', 'a2', 'l3', 's4']);

            await expect(
                instance.connect(addr1).makeAttempt(anyGuess, { value: ethers.utils.parseEther('0.0007') })
            ).to.be.revertedWithCustomError(instance, 'PlayerHasAlreadySolvedWordle');
        });

        it('should show the number of Wordles solved by a player has increased', async function () {
            const { instance, addr1 } = await loadFixture(deployWordleWithPuzzleSet);

            const wordlePuzzleNo = await instance.wordlePuzzleNo();
            expect(wordlePuzzleNo, 'Puzzle number did not increment').to.equal(1);
            const numOfPuzzleSolved = await instance.playerPuzzleSolvedCount(addr1.address);

            const correctGuess = convertLetterAndPositionToPrimes(['r0', 'a1', 'l2', 'l3', 'y4']);

            await expect(
                instance.connect(addr1).makeAttempt(correctGuess, { value: ethers.utils.parseEther('0.0007') })
            ).to.emit(instance, 'PlayerSolvedWordle');

            expect(
                await instance.playerPuzzleSolvedCount(addr1.address),
                'Number of puzzle solved should have increased'
            ).to.equal(numOfPuzzleSolved + 1);
        });
    });

    describe('Helper functions', async function () {
        describe('CheckIfSolved', async function () {
            it('should return true if all elements in the array of 2 element arrays are true', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const mockAnswer = [true, true, true, true, true, true, true, true, true];

                const isSolved = await instance.checkIfSolved(mockAnswer);
                expect(isSolved, 'Should be solved').to.equal(true);
            });

            it('should return false if at least one element is false', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const mockAnswer = [true, true, false, true, true, true, true, true, true, true];

                const mockAnswer2 = [true, true, false, true, true, true, true, false, true, true];

                const isSolved = await instance.checkIfSolved(mockAnswer);
                const isSolved2 = await instance.checkIfSolved(mockAnswer2);
                expect(isSolved, 'Should be solved').to.equal(false);
                expect(isSolved2, 'Should not be solved').to.equal(false);
            });
        });

        describe('VerifyMembership', async function () {
            it('should verify the membership of letters in the solution', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const solution = ['r0', 'A1', 'l2', 'L3', 'y4', 'r5', 'a5', 'l5', 'y5'];

                const _primes = solution.map(letterPosition => {
                    const [letter, position] = letterPosition.split('');
                    return letterToPrime(letter, position);
                });
                // console.log("Primes: ", _primes);

                const generator = Math.floor(Math.random() * 2 ** 16);
                // console.log("Generator: ", generator);
                const _modulus =
                    primes[Math.floor(Math.random() * primes.length)] *
                    primes[Math.floor(Math.random() * primes.length)];
                // console.log("Modulus: ", _modulus);

                const _accumulator = calculateAccumulator(_primes, generator, _modulus);
                // console.log("Accumulator: ", _accumulator);

                const witnesses = calculateWitnesses(_primes, generator, _modulus);
                // console.log("Witnesses: ", witnesses);

                await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses);

                const r5isMember = await instance.verifyMembership(letterToPrime('r', 5));
                const a5isMember = await instance.verifyMembership(letterToPrime('a', 5));
                const l5isMember = await instance.verifyMembership(letterToPrime('l', 5));
                const y5isMember = await instance.verifyMembership(letterToPrime('y', 5));
                const t5shouldNotBeMember = await instance.verifyMembership(letterToPrime('t', 5));
                const f5shouldNotBeMember = await instance.verifyMembership(letterToPrime('f', 5));
                const k5shouldNotBeMember = await instance.verifyMembership(letterToPrime('k', 5));

                expect(r5isMember).to.be.true;
                expect(a5isMember).to.be.true;
                expect(l5isMember).to.be.true;
                expect(y5isMember).to.be.true;
                expect(t5shouldNotBeMember).to.be.false;
                expect(f5shouldNotBeMember).to.be.false;
                expect(k5shouldNotBeMember).to.be.false;
            });
        });

        describe('VerifyPosition', async function () {
            it('should verify the position of letters in the solution', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const solution = ['r0', 'A1', 'l2', 'L3', 'y4', 'r5', 'a5', 'l5', 'y5'];
                const _primes = solution.map(letterPosition => {
                    const [letter, position] = letterPosition.split('');
                    return letterToPrime(letter, position);
                });
                // console.log("Primes: ", _primes);

                const generator = Math.floor(Math.random() * 2 ** 16);
                // console.log("Generator: ", generator);
                const _modulus =
                    primes[Math.floor(Math.random() * primes.length)] *
                    primes[Math.floor(Math.random() * primes.length)];
                // console.log("Modulus: ", _modulus);

                const _accumulator = calculateAccumulator(_primes, generator, _modulus);
                // console.log("Accumulator: ", _accumulator);

                const witnesses = calculateWitnesses(_primes, generator, _modulus);
                // console.log("Witnesses: ", witnesses);

                await instance.createNewWordlePuzzle(_accumulator, _modulus, witnesses);

                const r0isInCorrectPosition = await instance.verifyPosition(0, letterToPrime('r', 0));
                const a1isInCorrectPosition = await instance.verifyPosition(1, letterToPrime('a', 1));
                const l2isInCorrectPosition = await instance.verifyPosition(2, letterToPrime('l', 2));
                const l3isInCorrectPosition = await instance.verifyPosition(3, letterToPrime('l', 3));
                const y4isInCorrectPosition = await instance.verifyPosition(4, letterToPrime('y', 4));
                const l4shouldNotBeInTheCorrectPosition = await instance.verifyPosition(4, letterToPrime('l', 4));
                const r1shouldNotBeInTheCorrectPosition = await instance.verifyPosition(1, letterToPrime('r', 1));
                const k3shouldNotBeInTheCorrectPosition = await instance.verifyPosition(3, letterToPrime('k', 3));
                const z2shouldNotBeInTheCorrectPosition = await instance.verifyPosition(2, letterToPrime('z', 2));

                expect(r0isInCorrectPosition).to.be.true;
                expect(a1isInCorrectPosition).to.be.true;
                expect(l2isInCorrectPosition).to.be.true;
                expect(l3isInCorrectPosition).to.be.true;
                expect(y4isInCorrectPosition).to.be.true;

                expect(l4shouldNotBeInTheCorrectPosition).to.be.false;
                expect(r1shouldNotBeInTheCorrectPosition).to.be.false;
                expect(k3shouldNotBeInTheCorrectPosition).to.be.false;
                expect(z2shouldNotBeInTheCorrectPosition).to.be.false;
            });
        });
    });

    describe('Math functions', async function () {
        describe('Fast Exp Mod function / divide and conquer', async function () {
            it('should give the correct result for modular exponentiation of large numbers', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const testSet = Array.from({ length: 10 }, () => {
                    return {
                        base: Math.floor(2 ** 10 * Math.random() * 256),
                        exp: primes[Math.floor(Math.random() * primes.length)],
                        mod:
                            primes[Math.floor(Math.random() * primes.length)] *
                            primes[Math.floor(Math.random() * primes.length)]
                    };
                });

                for (let i = 0; i < testSet.length; i++) {
                    const fastMod = await instance.fastModExp(testSet[i].base, testSet[i].exp, testSet[i].mod);
                    const pMod = powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                    expect(fastMod.toNumber()).to.equal(pMod);
                }
            });
        });

        describe('IntToBinary function', async function () {
            it('should turn an integer into a small endian binary array representation', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const testSet = [2, 1, 30, 1234, 44, 3, 986, 12, 31234, 221, 84, 7639, 1294, 213, 11, 298];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await instance.intToBinary(testSet[i])).to.deep.equal(
                        testSet[i]
                            .toString(2)
                            .split('')
                            .map(x => +x)
                    );
                }
            });

            describe('Divide and conquer memo', async function () {
                it('should give the correct mod exp of an binary array for powers of two', async function () {
                    const { instance } = await loadFixture(deployWordleFixture);

                    const testSet = [
                        {
                            base: 21,
                            exponent: 34,
                            modulus: 65,
                            solution: [
                                BigNumber.from('1'), // 21^32 mod 65
                                BigNumber.from('1'), // 21^16 mod 65
                                BigNumber.from('1'), // 21^8 mod 65
                                BigNumber.from('1'), // 21^4 mod 65
                                BigNumber.from('51'), // 21^2 mod 65
                                BigNumber.from('21') // 21^1 mod 65
                            ]
                        },
                        {
                            base: 44,
                            exponent: 214,
                            modulus: 99,
                            solution: [
                                BigNumber.from('55'), // 44^128 mod 99
                                BigNumber.from('55'), // 44^64 mod 99
                                BigNumber.from('55'), // 44^32 mod 99
                                BigNumber.from('55'), // 44^16 mod 99
                                BigNumber.from('55'), // 44^8 mod 99
                                BigNumber.from('55'), // 44^4 mod 99
                                BigNumber.from('55'), // 44^2 mod 99
                                BigNumber.from('44') // 44^1 mod 99
                            ]
                        },
                        {
                            base: 2,
                            exponent: 1,
                            modulus: 10,
                            solution: [
                                BigNumber.from('2') // 2^1 mod 10
                            ]
                        }
                    ];

                    for (let i = 0; i < testSet.length; i++) {
                        const arrayToTest = await instance.intToBinary(testSet[i].exponent);
                        const s = await instance.createMemoArrayOfPowersOfTwo(
                            testSet[i].base,
                            arrayToTest,
                            testSet[i].modulus
                        );
                        expect(s).to.deep.equal(testSet[i].solution);
                    }
                });
            });

            describe('Power mod', async function () {
                it('should give the correct result for modular exponentiation', async function () {
                    const { instance } = await loadFixture(deployWordleFixture);

                    const testSet = [
                        {
                            base: Math.floor(Math.random() * 256),
                            exp: primes[Math.floor(Math.random() * primes.length)],
                            mod:
                                primes[Math.floor(Math.random() * primes.length)] *
                                primes[Math.floor(Math.random() * primes.length)]
                        },
                        {
                            base: Math.floor(Math.random() * 256),
                            exp: primes[Math.floor(Math.random() * primes.length)],
                            mod:
                                primes[Math.floor(Math.random() * primes.length)] *
                                primes[Math.floor(Math.random() * primes.length)]
                        },
                        {
                            base: Math.floor(Math.random() * 256),
                            exp: primes[Math.floor(Math.random() * primes.length)],
                            mod:
                                primes[Math.floor(Math.random() * primes.length)] *
                                primes[Math.floor(Math.random() * primes.length)]
                        },
                        {
                            base: Math.floor(Math.random() * 256),
                            exp: primes[Math.floor(Math.random() * primes.length)],
                            mod:
                                primes[Math.floor(Math.random() * primes.length)] *
                                primes[Math.floor(Math.random() * primes.length)]
                        }
                    ];

                    for (let i = 0; i < testSet.length; i++) {
                        // console.log(testSet[i]);
                        const pMod1 = await instance.powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                        const pMod2 = powerMod(testSet[i].base, testSet[i].exp, testSet[i].mod);
                        // console.log("Power Mod - Solidity: ", pMod1);
                        // console.log("Power Mod - JS: ", pMod1);
                        expect(pMod1.toNumber()).to.equal(pMod2);
                    }
                });
            });
        });

        describe('Log2ceil function', async function () {
            it('should give the correct result for the ceiling of log base 2', async function () {
                const { instance } = await loadFixture(deployWordleFixture);

                const testSet = [2, 20, 5, 1239, 652, 4097, 3, 551, 68, 90, 329, 11334];

                for (let i = 0; i < testSet.length; i++) {
                    expect(await instance.log2ceil(testSet[i])).to.equal(Math.ceil(Math.log2(testSet[i])));
                }
            });
        });
    });
});
