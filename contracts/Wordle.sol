// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

interface Leaderboard {
    function getRankings() external view returns ();
    function updateRankings() external;
}

contract Wordle {
    address public owner;
    address public leaderboard;
    uint256 public accumulator;
    uint256 public modulus;
    uint256[] public proofs; // [ 1µ, 2µ, 3µ, 4µ, 5µ, ...(2-5µ, depending on the word) ] where µ = letter
    uint256 public wordlePuzzleNo = 0; // updated daily

    // attempts[wordlePuzzleNo][user] => number of attempts by user at wordle puzzle number
    mapping(uint256 => mapping(address => uint8)) public attempts;
    mapping(address => uint256) public userPuzzleSolvedCount;

    constructor(address _leaderboard) {
        owner = msg.sender;
        leaderboard = _leaderboard;
    }

    function resetAttempts() internal {
        wordlePuzzleNo++;
    }

    function createNewWordlePuzzle(uint256 _accumulator, uint256 _modulus, uint256[] memory proofs) external {
        require(msg.sender == owner);

        accumulator = _accumulator;
        modulus = _modulus;
        proofs = _proofs;
        resetAttempts();
    }

    // Checks if the letter is in the solution set.
    // The wordle proofs will always map:
    // [ 1µ, 2µ, 3µ, 4µ, 5µ, ...(3-5µ, depending on the word) ]
    function verifyMembership(uint256 guess) external returns (bool) {
        for (uint8 i = 4; i < proofs.length; i++) {
            uint256 memory proof = proofs[i];
            if (proof**guess == accumulator%modulus) {
                return true;
            }
        }

        return false;
    }

    // Checks if the letter is in the correct position.
    function verifyPosition(uint8 index, uint256 guess) external returns (bool) {
        uint256 memory proof = proofs[index]; // proofs[index] = G**[Set \ value@index] % modulus

        if (proof**guess == accumulator%modulus) {
            return true;
        }

        return false;
    }
}
