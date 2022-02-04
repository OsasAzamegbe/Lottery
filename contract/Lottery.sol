// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Lottery {
	address public m_manager;
	
	constructor() {
		m_manager = msg.sender;
	}
}
