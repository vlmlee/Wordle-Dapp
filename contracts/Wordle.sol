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
    uint256[] public proofs;
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

    function createNewWordleSecret(uint256 _accumulator, uint256 _modulus, uint256[] memory proofs) external {
        require(msg.sender == owner);

        accumulator = _accumulator;
        modulus = _modulus;
        proofs = _proofs;
        resetAttempts();
    }

    function verifyGuess(uint8 index, uint256 guess) external returns (bool) {
        uint256 memory proof = proofs[index]; // proofs[index] = G**[Set \ value@index] % modulus

        if (proof**guess == accumulator%modulus) {
            return true;
        }

        return false;
    }
}
