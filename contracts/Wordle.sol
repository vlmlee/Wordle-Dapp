// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.9;

contract Wordle is ERC20("") {
    bytes32 public secret;
    mapping(address => uint256) public solveCount;

    constructor(string _secret) {
        secret = _secret;

    }

    function updateSecret(string newSecret) external {
        secret = newSecret;
    }

    function checkGuess() external {

    }

    function updateLeaderboard() internal {

    }
}
