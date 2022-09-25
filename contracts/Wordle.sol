// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

interface Leaderboard {
    function getRankings() external view returns ();
    function updateRankings() external;
}

// The solution for this puzzle can be easily obtained by a computer through brute force since
// the witnesses are embedded inside of this contract. This puzzle is not meant to be impossible to
// solve through guessing and checking. In fact, you should be able to solve Wordle in less than
// 6 tries! It is also not meant to cryptographically secure the secret. This is a demonstration
// to show that a solution can be encrypted in a RSA accumulator. This is -not- a zero knowledge
// proof since the proofs/witnesses are provided below.
contract Wordle is Leaderboard {
    address public owner;
    address public leaderboard;
    uint256 public wordlePuzzleNo = 0; // updated daily
    uint256 private accumulatorMod;
    uint256 private modulus;
    uint256[] private witnesses;
    uint8 private maxAttempts = 6;

    struct Attempts {
        mapping(address => uint8) attempts;
        uint256 length;
    }

    // number of attempts by user at wordle puzzle number = attempts[wordlePuzzleNo][user]
    mapping(uint256 => Attempts) public userAttempts;
    mapping(address => uint256) public userPuzzleSolvedCount;

    constructor(address _leaderboard) {
        owner = msg.sender;
        leaderboard = _leaderboard;
    }

    function createNewWordlePuzzle(uint256 _accumulatorMod, uint256 _modulus, uint256[] memory witnesses) external {
        require(msg.sender == owner);

        accumulatorMod = _accumulatorMod;
        modulus = _modulus;
        witnesses = _witnesses;
        resetAllAttempts();
    }

    function makeAttempt() external {

    }

    // Checks if the letter is in the solution set.
    // The wordle witnesses will always map:
    // [ 1µ, 2µ, 3µ, 4µ, 5µ, ...(3-5µ, depending on the word) ]
    function verifyMembership(uint256 guess) view external returns (bool) {
        require(witnesses.length > 0);
        require(userAttempts[wordlePuzzleNo][msg.sender] <= maxAttempts);

        for (uint8 i = 4; i < witnesses.length; i++) {
            uint256 memory witness = witnesses[i];
            if (fastModExp(witness, guess) == accumulatorMod) {
                return true;
            }
        }

        return false;
    }

    // Checks if the letter is in the correct position.
    function verifyPosition(uint8 index, uint256 guess) view external returns (bool) {
        require(witnesses.length > 0);
        require(userAttempts[wordlePuzzleNo][msg.sender] <= maxAttempts);

        uint256 memory witness = witnesses[index]; // witnesses[index] = G**[Set \ value@index] % modulus

        if (fastModExp(witness, guess) == accumulatorMod) {
            return true;
        }

        return false;
    }

    function resetAllAttempts() internal {
        wordlePuzzleNo++;
    }

    function fastModExp(uint8 base, uint256 exponent, uint256 modulus) pure internal returns (int result) {
        require(exponent < 1024);
        uint256[] binaryArr = intToBinary(exponent);
        uint256[] baseModExpArr = divideAndConquer(base, binaryArr, modulus);

        for (int8 i = 0; i < baseModExpArr.length; i++) {
            if (baseModExpArr[i] != 0) {
                result = result * baseModExpArr[i];
            }
        }

        return result;
    }

    // Dynamic programming to prevent expensive exponentiation
    function divideAndConquer(uint256 base, uint256[] memory binaryArr, uint256 modulus) pure internal returns (uint256[]) {
        uint256 memory memo = new uint8[](binaryArr.length);
        memo[0] = (base ** 0) % modulus;

        for (int8 i = 1; i < binaryArr.length; i++) {
            memo[i] = binaryArr[i] * ((memo[i - 1] * memo[i - 1]) % modulus);
        }

        return memo;
    }

    function intToBinary(uint8 n) pure internal returns (uint8[]) {
        require(n < 1024);

        uint8[] output = new uint8[](10);

        for (uint8 i = 0; i < 10; i++) {
            output[9 - i] = (n % 2 == 1) ? 1 : 0;
            n /= 2;
        }

        return output;
    }
}
