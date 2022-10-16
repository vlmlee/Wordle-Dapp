// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./WordleLeaderboard.sol";

interface ILeaderboard {

}

// The solution for this puzzle can be easily obtained by a computer through brute force since
// the witnesses are embedded inside of this contract. This puzzle is not meant to be impossible to
// solve through guessing and checking. In fact, you should be able to solve Wordle in less than
// 6 tries! This contract is also not meant to cryptographically secure the secret. This is a demonstration
// to show that a solution can be encrypted in a RSA accumulator without revealing what the secret (the Wordle
// solution) is. This is -not- a zero knowledge proof since the proofs/witnesses are provided below.
contract Wordle {
    address public owner;
    uint256 public wordlePuzzleNo = 0; // updated daily
    uint256 public accumulator;
    uint256 public modulus;
    uint256[] public witnesses;
    uint8 public constant MAX_ATTEMPTS = 5;
    uint256 public constant FEE = 700_000 gwei;
    ILeaderboard public leaderboard;

    event WithdrawalSuccessful(uint256 _value);
    event PlayerMadeAttempt(address indexed _player, uint8 attemptNumber, uint256 _wordlePuzzleNo);
    event PlayerSolvedWordle(address indexed _player);
    event LeaderboardSuccessfullyFunded(address indexed _leaderAddr, uint256 _amount);
    event CreatedNewWordlePuzzle(uint256 _accumulator, uint256 _modulus, uint256[] _witnesses);

    mapping(uint => mapping(address => uint8)) public playerAttempts;
    uint256 public playerAttemptsLength;

    mapping(address => uint256[][]) public currentAttempts;
    address[] public players;

    mapping(address => uint256) public playerPuzzleSolvedCount;
    mapping(address => mapping(uint256 => bool)) public playerPuzzleNumberSolved;
    uint256 public playerPuzzleSolvedCountLength;

    error PlayerIsNotOwner();
    error PlayerMustPayFeeToPlay(uint256 _fee);
    error WithdrawalFailed();
    error WithdrawalMustBeNonZero(uint256 _value);
    error PlayerHasMadeTooManyAttempts(string _message);
    error WordleIsNotReady();
    error PlayerHasAlreadySolvedWordle();
    error ContractHasNoBalance();
    error ContractDoesNotHaveEnoughFunds(uint256 _value);

    modifier MustBeOwner() {
        if (msg.sender != owner) revert PlayerIsNotOwner();
        _;
    }

    modifier WordleMustBeReady() {
        if (accumulator == 0 || modulus == 0 || witnesses.length == 0) revert WordleIsNotReady();
        _;
    }

    constructor() payable {
        owner = msg.sender;
    }

    receive() external payable {}

    function getCurrentAttempts(address _player) external view returns (uint256[][] memory) {
        return currentAttempts[_player];
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function setLeaderboardAddress(address _addr) external MustBeOwner payable {
        leaderboard = ILeaderboard(_addr);
    }

    function fundLeaderboard(uint256 _amount) external MustBeOwner payable {
        if (!((payable(address(this)).balance) > 0)) revert ContractHasNoBalance();
        if (_amount > (payable(address(this)).balance)) revert ContractDoesNotHaveEnoughFunds(_amount);

        (bool success,) = payable(address(leaderboard)).call{ value: _amount}("");

        if (success) {
            emit LeaderboardSuccessfullyFunded(address(leaderboard), _amount);
        }
    }

    function createNewWordlePuzzle(uint256 _accumulator, uint256 _modulus, uint256[] calldata _witnesses) external MustBeOwner {
        accumulator = _accumulator;
        modulus = _modulus;
        witnesses = _witnesses;
        resetAllAttempts();
        emit CreatedNewWordlePuzzle(_accumulator, _modulus, _witnesses);
    }

    function makeAttempt(uint256[] calldata guesses) public WordleMustBeReady payable returns (bool[] memory answer, bool isSolved) {
        if (msg.value < FEE) revert PlayerMustPayFeeToPlay(FEE);

        uint8 attemptNumber = playerAttempts[wordlePuzzleNo][msg.sender];
        if (attemptNumber > MAX_ATTEMPTS)
            revert PlayerHasMadeTooManyAttempts("Player has maxed out their attempts for this puzzle. Wait for the next Wordle to play again.");

        bool playerHasSolvedPuzzle = playerPuzzleNumberSolved[msg.sender][wordlePuzzleNo];
        if (playerHasSolvedPuzzle == true) revert PlayerHasAlreadySolvedWordle();

        answer = new bool[](guesses.length);

        for (uint8 i = 0; i < 5; i++) {
            bool isInTheCorrectPosition = verifyPosition(i, guesses[i]);
            answer[i] = isInTheCorrectPosition;
        }

        for (uint8 i = 5; i < guesses.length; i++) {
            bool isMember = verifyMembership(guesses[i]);
            answer[i] = isMember;
        }

        if ((playerPuzzleSolvedCount[msg.sender] == 0) && !playerHasAlreadyPlayed(msg.sender)) {
            players.push(msg.sender);
        }

        uint256[][] storage attemptsArr = currentAttempts[msg.sender];
        attemptsArr.push(guesses);

        playerAttempts[wordlePuzzleNo][msg.sender]++;
        emit PlayerMadeAttempt(msg.sender, playerAttempts[wordlePuzzleNo][msg.sender], wordlePuzzleNo);

        isSolved = checkIfSolved(answer);

        if (isSolved) {
            if (playerPuzzleSolvedCount[msg.sender] == 0) playerPuzzleSolvedCountLength++;
            playerPuzzleSolvedCount[msg.sender]++;
            playerPuzzleNumberSolved[msg.sender][wordlePuzzleNo] = true;
            emit PlayerSolvedWordle(msg.sender);
        }
    }

    function resetAllAttempts() public MustBeOwner {
        for (uint256 i = 0; i < players.length; i++) {
            delete currentAttempts[players[i]];
        }
        wordlePuzzleNo++;
    }

    function playerHasAlreadyPlayed(address _player) internal view returns (bool found) {
        found = false;
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == _player) found = true;
        }
    }

    function withdraw() public MustBeOwner {
        uint256 _value = payable(address(this)).balance;
        if (!(_value > 0)) revert WithdrawalMustBeNonZero(_value);
        (bool success,) = owner.call{ value: _value }("");
        if (!success) revert WithdrawalFailed();
        emit WithdrawalSuccessful(_value);
    }

    // Checks if the letter is in the solution set.
    // The wordle witnesses will always map:
    // [ 0µ, 1µ, 2µ, 3µ, 4µ, ...(2-5 µ, depending on the word) ]
    function verifyMembership(uint256 guess) public view WordleMustBeReady returns (bool) {
        for (uint8 i = 5; i < witnesses.length; i++) {
            uint256 witness = witnesses[i];
            uint256 verification = guess > 2**16 ? powerMod(witness, guess, modulus) : fastModExp(witness, guess, modulus);
            if (verification == accumulator) {
                return true;
            }
        }

        return false;
    }

    // Checks if the letter is in the correct position.
    function verifyPosition(uint8 index, uint256 guess) public view WordleMustBeReady returns (bool) {
        uint256 witness = witnesses[index]; // witnesses[index] = G**[Set \ value@index] % modulus
        uint256 verification = guess > 2**16 ? powerMod(witness, guess, modulus) : fastModExp(witness, guess, modulus);

        if (verification == accumulator) {
            return true;
        }

        return false;
    }

    function checkIfSolved(bool[] memory _answer) public pure returns (bool isAllTrue) {
        isAllTrue = true;

        for (uint8 i = 0; i < _answer.length; i++) {
            if (!_answer[i]) {
                isAllTrue = false;
                break;
            }
        }
    }

    // Use right-to-left binary method for large exponents. Here we divide instead of add in the divide and conquer strategy.
    function powerMod(uint256 _base, uint256 _exponent, uint256 _modulus) public pure returns (uint256 result) {
        if (_modulus == 1) return 0;
        result = 1;
        _base = _base % _modulus;
        while (_exponent > 0) {
            if (_exponent % 2 == 1)  //odd number
                result = (result * _base) % _modulus;
            _exponent = _exponent >> 1; //divide by 2
            _base = (_base * _base) % _modulus;
        }
        return result;
    }

    function fastModExp(uint256 _base, uint256 _exponent, uint256 _modulus) pure public returns (uint256) {
        uint8[] memory binaryArr = intToBinary(_exponent);
        return divideAndConquer(_base, binaryArr, _modulus);
    }

    // Dynamic programming to prevent expensive exponentiation and prevent overflow
    function divideAndConquer(uint256 _base, uint8[] memory binaryArr, uint256 _modulus) public pure returns (uint256 result) {
        if (_base == 0) return 0;

        uint256[] memory memo = createMemoArrayOfPowersOfTwo(_base, binaryArr, _modulus);

        // Zero out powers of two not present in binary array
        for (uint256 i = 0; i < binaryArr.length; i++) {
            memo[i] = binaryArr[i] * memo[i];
        }

        result = 1;

        // Multiply memoized elements to get base^(∑(elements in memo) = exponent) % modulus
        for (uint256 i = 0; i < memo.length; i++) {
            if (memo[i] != 0) {
                result = (result * memo[i]) % _modulus;
            }
        }

        return result;
    }

    function createMemoArrayOfPowersOfTwo(uint256 _base, uint8[] memory binaryArr, uint256 _modulus) public pure returns (uint256[] memory memo) {
        memo = new uint256[](binaryArr.length);
        memo[binaryArr.length - 1] = (_base ** 1) % _modulus;

        // Create memoized array of base^(powers of 2) % modulus
        for (uint256 i = binaryArr.length; i > 1; i--) {
            memo[i - 2] = ((memo[i - 1] * memo[i - 1]) % _modulus);
        }

        return memo;
    }

    // Outputs to binary array in a "big-endian"-like way, i.e. 30 = [1, 1, 1, 1, 0]
    function intToBinary(uint256 n) pure public returns (uint8[] memory output) {
        if (n == 1) {
            output = new uint8[](1);
            output[0] = 1;
            return output;
        } else if (n == 2) {
            output = new uint8[](2);
            output[0] = 1;
            output[1] = 0;
            return output;
        }

        uint binLength = log2ceil(n);
        output = new uint8[](binLength);

        for (uint256 i = binLength; i > 0; i--) {
            output[i-1] = (n % 2 == 1) ? 1 : 0;
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
