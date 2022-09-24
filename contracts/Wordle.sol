// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

interface Leaderboard {
    function getRankings() external view returns ();
    function updateRankings() external;
}

// The solution for this puzzle can be easily obtained by a computer through brute force since
// the proofs are embedded inside of this contract. This puzzle is not meant to be impossible to
// solve through guessing and checking. In fact, you should be able to solve Wordle in less than
// 6 tries! It is also not meant to cryptographically secure the secret. This is a demonstration
// to show that a solution can be encrypted in a RSA accumulator to make this puzzle an interactive
// zero knowledge proof.
contract Wordle is Leaderboard {
    address public owner;
    address public leaderboard;
    uint256 public wordlePuzzleNo = 0; // updated daily
    uint256 private accumulator;
    uint256 private modulus;
    uint256[] private proofs;
    uint8 private maxAttempts = 6;

    struct Attempt {
        mapping(address => uint8) attempts;
        uint256 length;
    }

    // number of attempts by user at wordle puzzle number = attempts[wordlePuzzleNo][user]
    mapping(uint256 => Attempt) public userAttempts;
    mapping(address => uint256) public userPuzzleSolvedCount;

    constructor(address _leaderboard) {
        owner = msg.sender;
        leaderboard = _leaderboard;
    }

    function createNewWordlePuzzle(uint256 _accumulator, uint256 _modulus, uint256[] memory proofs) external {
        require(msg.sender == owner);

        accumulator = _accumulator;
        modulus = _modulus;
        proofs = _proofs;
        resetAllAttempts();
    }

    function makeAttempt() external {

    }

    // Checks if the letter is in the solution set.
    // The wordle proofs will always map:
    // [ 1µ, 2µ, 3µ, 4µ, 5µ, ...(3-5µ, depending on the word) ]
    function verifyMembership(uint256 guess) view external returns (bool) {
        require(proofs.length > 0);
        require(userAttempts[wordlePuzzleNo][msg.sender] <= maxAttempts);

        for (uint8 i = 4; i < proofs.length; i++) {
            uint256 memory proof = proofs[i];
            if (proof**guess == accumulator%modulus) {
                return true;
            }
        }

        return false;
    }

    // Checks if the letter is in the correct position.
    function verifyPosition(uint8 index, uint256 guess) view external returns (bool) {
        require(proofs.length > 0);
        require(userAttempts[wordlePuzzleNo][msg.sender] <= maxAttempts);

        uint256 memory proof = proofs[index]; // proofs[index] = G**[Set \ value@index] % modulus

        if (proof**guess == accumulator%modulus) {
            return true;
        }

        return false;
    }

    function resetAllAttempts() internal {
        wordlePuzzleNo++;
    }
}
