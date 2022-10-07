// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Leaderboard {
    address public facilitator;
    bytes32 public leaderboardName;
    uint256 public endTime;
    uint256 public rewardPool;

    event RankingAdded(Ranking _ranking);
    event RankingRemoved(Ranking _ranking);
    event RankingUpdated(Ranking _ranking);
    event UserStakeAdded(address indexed _user, Stake _stake);
    event UserStakeWithdrawn(address indexed _user, Stake _stake);

     modifier OnlyFacilitator() {
        require(msg.sender == facilitator, "User is not the facilitator.");
        _;
    }

    modifier NonZeroRank(uint8 _rank) {
        require(_rank > 0, "Rank has to be greater than 1.");
        _;
    }

    struct Ranking {
        uint8 id; // ID to make sure that the choice is unique.
        bytes32 name;
        uint8 rank;
        bytes data; // arbitrary criteria for ranking
    }

    struct Rankings {
        mapping(uint8 => Ranking) ranks; // id -> Ranking
        uint8 currentId;
        uint8 size;
    }
    Rankings public rankings;

    struct Stake {
        address addr;
        uint8 id;
        bytes32 name;
        uint256 liquidity; // a user's stake
    }

    struct UserStakes {
        mapping(uint8 => Stake[]) stakes;
        uint256 size;
    }
    UserStakes public userStakes;

    error UserAlreadyStaked(string _errorMessage);
    error UserHasNotStakedYet(address _user);
    error ContractEnded(uint256 _endTime, uint256 currentTime);
    error UnableToWithdrawStake(address _user);
    error RankingDoesNotExist(uint8 _id, uint8 rank, bytes32 _name);

    constructor(bytes32 _leaderboardName, uint256 _endTime) {
        facilitator = msg.sender;
        leaderboardName = _leaderboardName;
        endTime = _endTime;
    }

    receive() external payable {}

    function getRanking(uint8 _rank) public view NonZeroRank(_rank) returns (Ranking memory) {
        Ranking memory ranking;

        for (uint8 i = 0; i < rankings.size; i++) {
            if (rankings.ranks[i].rank == _rank) {
                ranking = rankings.ranks[i];
            }
        }

        if (ranking.rank == 0) {
            revert RankingDoesNotExist(0, _rank, bytes32(0));
        }

        return ranking;
    }

    function addRanking(uint8 _rank, bytes32 _name, bytes calldata _data) public OnlyFacilitator NonZeroRank(_rank) {
        require(_name != 0, "A name has to be used to be added to the rankings.");

        Ranking storage ranking = rankings.ranks[rankings.currentId];
        ranking.id = rankings.currentId;
        ranking.name = _name;
        ranking.rank = _rank;
        ranking.data = _data;

        rankings.currentId++;
        rankings.size++;

        emit RankingAdded(ranking);
    }

    function removeRanking(uint8 _id, uint8 _rank, bytes32 _name) public OnlyFacilitator NonZeroRank(_rank) {
        if (rankings.ranks[_id].id != 0) {
            Ranking memory ranking = rankings.ranks[_id];
            require(ranking.rank == _rank && ranking.name == _name, "Ranking choice does not exist.");

            if (userStakes.size > 0) {
                returnStakes(_id);
            }
            delete rankings.ranks[_id];
            rankings.size--;
            emit RankingRemoved(ranking);
        } else {
            revert RankingDoesNotExist(_id, _rank, _name);
        }
    }

    function updateRanking(uint8 _id, uint8 _rank, bytes32 _name) public OnlyFacilitator NonZeroRank(_rank) returns (Ranking memory) {
        Ranking storage ranking = rankings.ranks[_id];

        if (ranking.id != _id) {
            revert RankingDoesNotExist(0, _rank, bytes32(0));
        }

        ranking.rank = _rank;

        if (_name != 0) {
            ranking.name = _name;
        }

        emit RankingUpdated(ranking);
        return rankings.ranks[_id];
    }

    function addStake(uint8 _id, bytes32 _name) public virtual payable {
        if (block.timestamp > endTime) revert ContractEnded(endTime, block.timestamp);
        require(_id < rankings.currentId, "Ranking choice does not exist.");

        Ranking memory ranking = rankings.ranks[_id];
        require(_name == ranking.name, "Name does not match.");
        require(msg.value > 0, "Stake has to be a non-zero amount");

        Stake[] storage stakes = userStakes.stakes[_id];

        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].addr == msg.sender) {
                revert UserAlreadyStaked("User has already staked for this choice. Withdraw your initial stake first if you want to change your stake.");
            }
        }

        Stake memory stake = Stake({
            addr: msg.sender,
            liquidity: msg.value,
            id: _id,
            name: _name
        });

        stakes.push(stake);

        addToRewardPool(stake.liquidity);
        assert(rewardPool >= stake.liquidity);
        userStakes.size++;

        emit UserStakeAdded(msg.sender, stake);
    }

    function withdrawStake(address _user, uint8 _id) public virtual {
        require(msg.sender == _user || msg.sender == facilitator, "Transaction sender is neither the owner of the stake or the facilitator.");
        require(userStakes.stakes[_id].length > 0, "There are no stakes for this choice yet.");
        
        Stake[] storage stakes = userStakes.stakes[_id];
        Stake memory stake;
        uint256 indexToRemove;

        for (uint256 i = 0; i < stakes.length; i++) {
            if (stakes[i].addr == _user) {
                stake = stakes[i];
                indexToRemove = i;
                break;
            }
        }

        if (stake.addr == address(0)) {
            revert UserHasNotStakedYet(_user);
        }

        uint256 userStakedAmount = stake.liquidity;
        assert(userStakedAmount > 0);
        (bool success, ) = payable(_user).call{ value: userStakedAmount }("");

        if (success) {
            uint256 rewardPoolPrev = rewardPool;
            removeFromRewardPool(userStakedAmount);
            assert(rewardPool < rewardPoolPrev);
            
            // Trick to remove unordered elements in an array in O(1) without needing to shift elements.
            delete stakes[indexToRemove];
            stakes[indexToRemove] = stakes[stakes.length - 1]; // Copy the last element to the removed element's index.
            stakes.pop();

            if (userStakes.size > 0) {
                userStakes.size--;
            }

            emit UserStakeWithdrawn(_user, stake);
        } else {
            revert UnableToWithdrawStake(_user);
        }
    }

    /**
     * Allocation depends on what type of contract the owner wants to implement.
     * Examples:
     *  Contract types:
     *  1. First past the post: winner takes all.
     *  2. Rank choice: reward is proportional to the ranking achieved.
     *  3. Rank changed: reward is proportional to the ranking net change.
     */
    function allocateReward() external virtual OnlyFacilitator {

    }

    function destroyContract() external OnlyFacilitator {
        uint8 i = 0;

        while (userStakes.size > 0 && i <= rankings.currentId) {
            returnStakes(i);
            i++;
        }

        // self destruct, all remaining ETH goes to facilitator
        selfdestruct(payable(facilitator));
    }

    // Internal functions

    function returnStakes(uint8 _id) internal OnlyFacilitator {
        require(userStakes.size > 0, "There are currently no stakes to return.");

        Stake[] memory stakes = userStakes.stakes[_id];

        for (uint256 i = 0; i < stakes.length; i++) {
            Stake memory stake = stakes[i];

            require(stake.id == _id, "ID does not match.");

            uint256 userStakedAmount = stake.liquidity;
            assert(userStakedAmount > 0);
            (bool success, ) = payable(stake.addr).call{ value: userStakedAmount }("");

            if (success) {
                uint256 rewardPoolPrev = rewardPool;
                removeFromRewardPool(userStakedAmount);
                assert(rewardPool < rewardPoolPrev);
                
                if (userStakes.size > 0) {
                    userStakes.size--;
                }
            } else {
                revert UnableToWithdrawStake(stake.addr);
            }
        }

        delete userStakes.stakes[_id];
    }

    function addToRewardPool(uint256 _liquidity) internal returns (uint256) {
        rewardPool += _liquidity;
        return rewardPool;
    }

    function removeFromRewardPool(uint256 _liquidity) internal returns (uint256) {
        rewardPool -= _liquidity;
        return rewardPool;
    }
}
