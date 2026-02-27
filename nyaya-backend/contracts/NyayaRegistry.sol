// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NyayaRegistry {
    // A mapping to store document/chat hashes and their timestamp
    mapping(string => uint256) public records;

    // Event to log when a new record is added
    event RecordAdded(string dataHash, uint256 timestamp, address addedBy);

    // Function to save a new hash to the blockchain
    function addRecord(string memory _dataHash) public {
        require(records[_dataHash] == 0, "Record already exists!");
        
        records[_dataHash] = block.timestamp;
        emit RecordAdded(_dataHash, block.timestamp, msg.sender);
    }

    // Function to verify if a record exists and when it was added
    function verifyRecord(string memory _dataHash) public view returns (uint256) {
        return records[_dataHash];
    }
}
