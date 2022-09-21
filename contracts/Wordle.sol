// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

interface Leaderboard {
    function getRankings() external view returns ();
    function updateRankings() external;
}

contract Wordle is ERC20("") {
    bytes32 public secret;
    address leaderboard;
    mapping(address => uint256) public solveCount;

    constructor(bytes32 _secret, address _leaderboard) {
        secret = _secret;
        leaderboard = _leaderboard;
    }

    function updateSecret(bytes32 newSecret) external {
        secret = newSecret;
    }

    function checkGuess() external {

    }

    function updateLeaderboard() internal {
        Leaderboard(leaderboardAddr).getRankings();
    }

    function getSecret() external returns (bytes32) {
        return secret;
    }
}
