// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./WordleLeaderboard.sol";

// The solution for this puzzle can be easily obtained by a computer through brute force since
// the witnesses are embedded inside of this contract. This puzzle is not meant to be impossible to
// solve through guessing and checking. In fact, you should be able to solve Wordle in less than
// 6 tries! It is also not meant to cryptographically secure the secret. This is a demonstration
// to show that a solution can be encrypted in a RSA accumulator. This is -not- a zero knowledge
// proof since the proofs/witnesses are provided below.
contract Wordle {
    address public owner;
    WordleLeaderboard public leaderboard;
    uint256 public wordlePuzzleNo = 0; // updated daily
    uint256 private accumulatorMod;
    uint256 private modulus;
    uint256[] private witnesses;
    uint8 private maxAttempts = 6;

    struct Attempts {
        mapping(address => uint8) attempts;
        uint256 length;
    }

    // number of attempts by user at wordle puzzle number = userAttempts[wordlePuzzleNo][user]
    mapping(uint256 => Attempts) public userAttempts;
    mapping(address => uint256) public userPuzzleSolvedCount;

    constructor() {
        owner = msg.sender;
    }

    function setLeaderboardAddress(uint256 _endTime) external payable {
        leaderboard = new WordleLeaderboard(bytes32("Wordle Leaderboard"), _endTime);
    }

    function createNewWordlePuzzle(uint256 _accumulatorMod, uint256 _modulus, uint256[] memory _witnesses) external {
        require(msg.sender == owner);

        accumulatorMod = _accumulatorMod;
        modulus = _modulus;
        witnesses = _witnesses;
        resetAllAttempts();
    }

    function makeAttempt() public payable {
        require(msg.value >= 100000 gwei); // Calculate some minimum cost to play, $0.25/attempt


    }

    function withdraw() public {
        require(msg.sender == owner);
        (bool success,) = owner.call{ value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // Checks if the letter is in the solution set.
    // The wordle witnesses will always map:
    // [ 0µ, 1µ, 2µ, 3µ, 4µ, ...(2-5 µ, depending on the word) ]
    // "index" parameter will always be 5 as guess will have "5" prefixed to the letter.
    function verifyMembership(uint8 index, uint256 guess) view external returns (bool) {
        require(witnesses.length > 0);
        require(index == 5);
        require(userAttempts[wordlePuzzleNo].attempts[msg.sender] <= maxAttempts);

        for (uint8 i = 4; i < witnesses.length; i++) {
            uint256 witness = witnesses[i];
            if (fastModExp(witness, guess, modulus) == accumulatorMod) {
                return true;
            }
        }

        return false;
    }

    // Checks if the letter is in the correct position.
    function verifyPosition(uint8 index, uint256 guess) view external returns (bool) {
        require(witnesses.length > 0);
        require(userAttempts[wordlePuzzleNo].attempts[msg.sender] <= maxAttempts);

        uint256 witness = witnesses[index]; // witnesses[index] = G**[Set \ value@index] % modulus

        if (fastModExp(witness, guess, modulus) == accumulatorMod) {
            return true;
        }

        return false;
    }

    function resetAllAttempts() internal {
        wordlePuzzleNo++;
    }

    function fastModExp(uint256 base, uint256 exponent, uint256 _modulus) pure internal returns (uint256) {
        require(exponent < 1024);
        uint8[] memory binaryArr = intToBinary(exponent);
        return divideAndConquer(base, binaryArr, _modulus);
    }

    // Dynamic programming to prevent expensive exponentiation and prevent overflow
    function divideAndConquer(uint256 base, uint8[] memory binaryArr, uint256 _modulus) pure internal returns (uint256 result) {
        uint256[] memory memo = new uint256[](binaryArr.length);
        memo[0] = (base ** 1) % _modulus;

        // Create memoized array of base^(powers of 2)
        for (uint256 i = 1; i < binaryArr.length; i++) {
            memo[i] = ((memo[i - 1] * memo[i - 1]) % _modulus);
        }

        // Zero out powers of two not present in binary array
        for (uint256 i = 0; i < binaryArr.length; i++) {
            memo[i] = binaryArr[i] * memo[i];
        }

        result = memo[0] != 0 ? memo[0] : 1;

        // Multiply memoized elements to get base^(∑(elements in memo) = exponent) % modulus
        for (uint256 i = 1; i < memo.length; i++) {
            if (memo[i] != 0) {
                result = (result * memo[i]) % _modulus;
            }
        }

        return result;
    }

    // Outputs to binary array in a "little-endian"-like way, i.e. 30 = [0, 1, 1, 1, 1]
    function intToBinary(uint256 n) pure internal returns (uint8[] memory output) {
        require(n < 1024);

        uint binLength = log2ceil(n);
        output = new uint8[](binLength);

        for (uint8 i = 0; i <= binLength; i++) {
            output[binLength - i] = (n % 2 == 1) ? 1 : 0;
            n /= 2;
        }

        return output;
    }

    // Should use an external library for security.
    function log2ceil(uint x) public pure returns (uint y) {
        assembly {
            let arg := x
            x := sub(x,1)
            x := or(x, div(x, 0x02))
            x := or(x, div(x, 0x04))
            x := or(x, div(x, 0x10))
            x := or(x, div(x, 0x100))
            x := or(x, div(x, 0x10000))
            x := or(x, div(x, 0x100000000))
            x := or(x, div(x, 0x10000000000000000))
            x := or(x, div(x, 0x100000000000000000000000000000000))
            x := add(x, 1)
            let m := mload(0x40)
            mstore(m,           0xf8f9cbfae6cc78fbefe7cdc3a1793dfcf4f0e8bbd8cec470b6a28a7a5a3e1efd)
            mstore(add(m,0x20), 0xf5ecf1b3e9debc68e1d9cfabc5997135bfb7a7a3938b7b606b5b4b3f2f1f0ffe)
            mstore(add(m,0x40), 0xf6e4ed9ff2d6b458eadcdf97bd91692de2d4da8fd2d0ac50c6ae9a8272523616)
            mstore(add(m,0x60), 0xc8c0b887b0a8a4489c948c7f847c6125746c645c544c444038302820181008ff)
            mstore(add(m,0x80), 0xf7cae577eec2a03cf3bad76fb589591debb2dd67e0aa9834bea6925f6a4a2e0e)
            mstore(add(m,0xa0), 0xe39ed557db96902cd38ed14fad815115c786af479b7e83247363534337271707)
            mstore(add(m,0xc0), 0xc976c13bb96e881cb166a933a55e490d9d56952b8d4e801485467d2362422606)
            mstore(add(m,0xe0), 0x753a6d1b65325d0c552a4d1345224105391a310b29122104190a110309020100)
            mstore(0x40, add(m, 0x100))
            let magic := 0x818283848586878898a8b8c8d8e8f929395969799a9b9d9e9faaeb6bedeeff
            let shift := 0x100000000000000000000000000000000000000000000000000000000000000
            let a := div(mul(x, magic), shift)
            y := div(mload(add(m,sub(255,a))), shift)
            y := add(y, mul(256, gt(arg, 0x8000000000000000000000000000000000000000000000000000000000000000)))
        }
    }
}
