// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Lottery {
    address public m_manager;
    address payable[] public m_players;

    constructor() {
        m_manager = msg.sender;
    }

    function getPlayers() public view returns(address payable[] memory) {
        return m_players;
    }

    function enterLottery() public payable {
        require(msg.value >= 0.01 ether);
        m_players.push(payable(msg.sender));
    }

    //psuedo-random uint gen.
    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encode(block.difficulty, block.timestamp, m_players)
                )
            );
    }

    function pickWinner() public managerRestricted {
        uint256 index = random() % m_players.length;
        m_players[index].transfer(address(this).balance);
        m_players = new address payable[](0);
    }

    modifier managerRestricted() {
        require(msg.sender == m_manager);
        _;
    }
}
