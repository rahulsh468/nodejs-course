// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
    uint8 constant STATUS_NOT_ASSIGNED = 0;
    uint8 constant STATUS_WIN = 1;
    uint8 constant STATUS_LOSE = 2;
    uint8 constant STATUS_TIE = 3;
    uint8 constant STATUS_PENDING = 4;

    uint8 constant STATUS_NOT_STARTED = 1;
    uint8 constant STATUS_STARTED = 2;
    uint8 constant STATUS_COMPLETE = 3;
    uint8 constant STATUS_CANCELLED = 4;

    IERC20 token;
    address owner;
    bool destroyed = false;

    uint256 public gameCounter;
    address payable private royaltiesReceiver;
    uint8 royaltiesPercentage;
    uint256 royaltiesPrice;

    struct Bet {
        address payable addr;
        uint8 status;
    }

    struct Game {
        bytes32 gameId;
        uint256 betAmount;
        Bet creator;
        Bet taker;
        uint8 status;
        uint256 createdAt;
    }

    mapping(bytes32 => Game) games;
    mapping(uint256 => bytes32) gameid;

    event gameEvent(
        bytes32 indexed _gameId,
        uint256 indexed _betAmount,
        Bet _creator,
        Bet _taker,
        uint8 _status,
        uint256 _createdAt,
        string indexed _eventType,
        string _moves
    );

    modifier ownerOnly() {
        require(
            msg.sender == owner,
            "The operation is only available to the contract creator"
        );
        _;
    }

    modifier contractAvailable() {
        require(destroyed == false, "Contract work is suspended");
        _;
    }

    constructor(
        address _royaltiesReceiver,
        uint8 _royaltiesPercentage,
        IERC20 _token
    ) {
        owner = msg.sender;
        royaltiesReceiver = payable(_royaltiesReceiver);
        royaltiesPercentage = _royaltiesPercentage;
        token = _token;
    }

    function createBet(
        bytes32 _gameId,
        uint256 _amount
    ) external payable contractAvailable {
        if (_amount != 0) {
            require(_amount <= token.balanceOf(msg.sender), "Balance is low");
            uint256 allowance = token.allowance(msg.sender, address(this));
            require(allowance >= _amount, "Check the token allowance");
            token.transferFrom(msg.sender, address(this), _amount);
        }

        Game memory newGame = Game({
            gameId: _gameId,
            betAmount: _amount,
            creator: Bet(payable(msg.sender), STATUS_PENDING),
            taker: Bet(payable(0), STATUS_NOT_ASSIGNED),
            status: STATUS_NOT_STARTED,
            createdAt: block.timestamp
        });

        games[_gameId] = newGame;
        gameid[gameCounter] = _gameId;
        gameCounter++;

        emit gameEvent(
            newGame.gameId,
            newGame.betAmount,
            newGame.creator,
            newGame.taker,
            newGame.status,
            newGame.createdAt,
            "created",
            ""
        );
    }

    function takeBet(
        bytes32 _gameId,
        uint256 _amount
    ) external contractAvailable {
        Game storage currentGame = games[_gameId];

        require(
            _amount == currentGame.betAmount,
            "The value of the bet is not equal to the required"
        );
        require(
            msg.sender != currentGame.creator.addr,
            "The creator of the game can't join it "
        );

        if (_amount != 0) {
            require(_amount <= token.balanceOf(msg.sender), "Balance is low");
            uint256 allowance = token.allowance(msg.sender, address(this));
            require(allowance >= _amount, "Check the token allowance");
            token.transferFrom(msg.sender, address(this), _amount);
        }

        currentGame.taker = Bet(payable(msg.sender), STATUS_PENDING);
        currentGame.status = STATUS_STARTED;

        emit gameEvent(
            currentGame.gameId,
            currentGame.betAmount,
            currentGame.creator,
            currentGame.taker,
            currentGame.status,
            currentGame.createdAt,
            "accepted",
            ""
        );
    }

    function withdraw(
        bytes32 _gameId,
        uint8 STATUS_CREATOR,
        uint8 STATUS_TAKER,
        string calldata _moves
    ) external ownerOnly contractAvailable nonReentrant returns (uint256) {
        Game storage currentGame = games[_gameId];

        currentGame.status = STATUS_COMPLETE;
        currentGame.creator.status = STATUS_CREATOR;
        currentGame.taker.status = STATUS_TAKER;

        if (currentGame.betAmount != 0) {
            royaltyInfo(currentGame.betAmount * 2, royaltiesPercentage);
            token.transfer(royaltiesReceiver, royaltiesPrice);

            if (currentGame.creator.status == STATUS_WIN) {
                uint256 erc20balance = token.balanceOf(address(this));
                require(
                    (currentGame.betAmount * 2) - royaltiesPrice <=
                        erc20balance,
                    "Balance is low"
                );
                token.transfer(
                    currentGame.creator.addr,
                    (currentGame.betAmount * 2) - royaltiesPrice
                );
            } else if (currentGame.taker.status == STATUS_WIN) {
                token.transfer(
                    currentGame.taker.addr,
                    (currentGame.betAmount * 2) - royaltiesPrice
                );
            } else if (
                currentGame.creator.status == STATUS_TIE ||
                currentGame.taker.status == STATUS_TIE
            ) {
                token.transfer(
                    currentGame.taker.addr,
                    currentGame.betAmount - (royaltiesPrice / 2)
                );
                token.transfer(
                    currentGame.taker.addr,
                    currentGame.betAmount - (royaltiesPrice / 2)
                );
            }
        }

        emit gameEvent(
            currentGame.gameId,
            currentGame.betAmount,
            currentGame.creator,
            currentGame.taker,
            currentGame.status,
            currentGame.createdAt,
            "completed",
            _moves
        );

        delete (games[_gameId]);

        for (uint i = 0; i < gameCounter; i++) {
            if (gameid[i] == _gameId) {
                delete (gameid[i]);
            }
        }

        return royaltiesPrice;
    }

    function cancel(bytes32 _gameId) external contractAvailable nonReentrant {
        Game storage currentGame = games[_gameId];

        require(
            msg.sender == currentGame.creator.addr,
            "Only the creator of the game can cancel it"
        );

        if (currentGame.betAmount != 0) {
            token.transfer(currentGame.creator.addr, currentGame.betAmount);

            if (currentGame.status == STATUS_STARTED) {
                token.transfer(currentGame.taker.addr, currentGame.betAmount);
            }
        }

        currentGame.status = STATUS_CANCELLED;
        emit gameEvent(
            currentGame.gameId,
            currentGame.betAmount,
            currentGame.creator,
            currentGame.taker,
            currentGame.status,
            currentGame.createdAt,
            "cancelled",
            ""
        );

        delete (games[_gameId]);

        for (uint i = 0; i < gameCounter; i++) {
            if (gameid[i] == _gameId) {
                delete (gameid[i]);
            }
        }
    }

    function royaltyInfo(uint256 _price, uint8 _royaltiesPercentage) internal {
        royaltiesPrice = (_price * _royaltiesPercentage) / 100;
    }

    function getGames(
        uint8 _status
    ) external view contractAvailable returns (Game[] memory) {
        Game[] memory result = new Game[](getCount(_status));
        uint256 counter = 0;

        for (uint i = 0; i < gameCounter; i++) {
            if (games[gameid[i]].status == _status) {
                Game memory game = games[gameid[i]];
                result[counter] = game;
                counter++;
            }
        }

        return result;
    }

    function getGamesByUser(
        address _user
    ) external view contractAvailable returns (Game[] memory) {
        Game[] memory result = new Game[](getCount(_user));
        uint256 counter = 0;

        for (uint i = 0; i < gameCounter; i++) {
            if (
                games[gameid[i]].creator.addr == _user ||
                games[gameid[i]].taker.addr == _user
            ) {
                Game memory game = games[gameid[i]];
                result[counter] = game;
                counter++;
            }
        }

        return result;
    }

    function finalize() external ownerOnly contractAvailable nonReentrant {
        for (uint i = 0; i < gameCounter; i++) {
            Game memory currentGame = games[gameid[i]];

            if (currentGame.betAmount != 0) {
                if (currentGame.status == STATUS_NOT_STARTED) {
                    token.transfer(
                        currentGame.creator.addr,
                        currentGame.betAmount
                    );
                } else if (currentGame.status == STATUS_STARTED) {
                    token.transfer(
                        currentGame.creator.addr,
                        currentGame.betAmount
                    );
                    token.transfer(
                        currentGame.taker.addr,
                        currentGame.betAmount
                    );
                }
            }

            games[gameid[i]].status = STATUS_CANCELLED;

            emit gameEvent(
                currentGame.gameId,
                currentGame.betAmount,
                currentGame.creator,
                currentGame.taker,
                currentGame.status,
                currentGame.createdAt,
                "cancelled",
                ""
            );

            delete (games[gameid[i]]);
            delete (gameid[i]);
        }

        destroyed = true;
    }

    function getCount(uint8 _status) internal view returns (uint) {
        uint count;

        for (uint i = 0; i < gameCounter; i++) {
            if (games[gameid[i]].status == _status) {
                count++;
            }
        }

        return count;
    }

    function getCount(address _user) internal view returns (uint) {
        uint count;

        for (uint i = 0; i < gameCounter; i++) {
            if (
                games[gameid[i]].creator.addr == _user ||
                games[gameid[i]].taker.addr == _user
            ) {
                count++;
            }
        }

        return count;
    }
     function getRoyalty(bytes32 _gameId) external view contractAvailable returns (uint256) {
        Game storage currentGame = games[_gameId];

        if (royaltiesPercentage == 5 && currentGame.betAmount != 0) {
            uint256 royaltyAmount = (currentGame.betAmount * 5) / 100;
            return royaltyAmount;
        }

        return 0;
    }
    function getRoyaltyInternal(bytes32 _gameId) public view contractAvailable returns (uint256) {
        Game storage currentGame = games[_gameId];

        if (royaltiesPercentage == 5 && currentGame.betAmount != 0) {
            uint256 royaltyAmount = (currentGame.betAmount * 5) / 100;
            return royaltyAmount;
        }

        return 0;
    }
    function getTotalRoyaltyEarned() external view returns (uint256) {
        uint256 totalRoyalty = 0;

        for (uint256 i = 0; i < gameCounter; i++) {
            Game storage currentGame = games[gameid[i]];

            if (currentGame.creator.addr == owner) {
                uint256 royaltyAmount = getRoyaltyInternal(gameid[i]);
                totalRoyalty += royaltyAmount;
            }
        }

        return totalRoyalty;
    }
}
