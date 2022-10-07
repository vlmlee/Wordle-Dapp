// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./Leaderboard.sol";

contract WordleLeaderboard is Leaderboard {

    constructor(bytes32 _name, uint256 _endTime) Leaderboard(_name, _endTime) {

    }


}
