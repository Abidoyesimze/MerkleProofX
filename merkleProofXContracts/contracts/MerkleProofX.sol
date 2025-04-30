// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MerkleProofX
 * @dev A decentralized contract for verifying Merkle proofs for address lists
 */
contract MerkleProofX {
    // Struct to store Merkle tree information
    struct MerkleTreeInfo {
        string description;
        uint256 timestamp;
        uint256 listSize;
        address creator;
        bool isActive;
    }

    // Platform fee configuration
    uint256 public platformFee = 0.001 ether; // 0.001 ETH fee
    address public platformTreasury;
    
    // Track user's first tree status
    mapping(address => bool) public isNewcomer;
    
    // Mapping to store Merkle roots and their information
    mapping(bytes32 => MerkleTreeInfo) public merkleTrees;
    
    // Events
    event MerkleTreeAdded(bytes32 indexed root, string description, uint256 listSize, address creator, uint256 feePaid);
    event MerkleTreeRemoved(bytes32 indexed root, address remover);
    event MerkleTreeUpdated(bytes32 indexed root, string newDescription, address updater);
    event PlatformFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);
    event FeeCollected(address user, uint256 amount);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        platformTreasury = _treasury;
    }

    /**
     * @dev Adds a new Merkle root to the contract
     * @param _root The Merkle root to add
     * @param _description Description of the list
     * @param _listSize Number of addresses in the list
     */
    function addMerkleTree(
        bytes32 _root,
        string memory _description,
        uint256 _listSize
    ) external payable {
        require(!merkleTrees[_root].isActive, "Tree already exists");
        require(_listSize > 0, "List size must be greater than 0");
        require(bytes(_description).length > 0, "Description cannot be empty");

        // Handle platform fee
        if (!isNewcomer[msg.sender]) {
            require(msg.value >= platformFee, "Insufficient fee");
            (bool success, ) = platformTreasury.call{value: msg.value}("");
            require(success, "Fee transfer failed");
            emit FeeCollected(msg.sender, msg.value);
        } else {
            isNewcomer[msg.sender] = false; // User is no longer a newcomer
        }
        
        merkleTrees[_root] = MerkleTreeInfo({
            description: _description,
            timestamp: block.timestamp,
            listSize: _listSize,
            creator: msg.sender,
            isActive: true
        });

        emit MerkleTreeAdded(_root, _description, _listSize, msg.sender, msg.value);
    }

    /**
     * @dev Updates platform fee (only callable by treasury)
     * @param _newFee New platform fee in wei
     */
    function updatePlatformFee(uint256 _newFee) external {
        require(msg.sender == platformTreasury, "Only treasury can update fee");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    /**
     * @dev Updates treasury address (only callable by current treasury)
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external {
        require(msg.sender == platformTreasury, "Only treasury can update address");
        require(_newTreasury != address(0), "Invalid treasury address");
        platformTreasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @dev Updates a Merkle tree's description
     * @param _root The Merkle root to update
     * @param _newDescription New description
     */
    function updateMerkleTreeDescription(
        bytes32 _root,
        string memory _newDescription
    ) external {
        require(merkleTrees[_root].isActive, "Tree does not exist");
        require(merkleTrees[_root].creator == msg.sender, "Only creator can update");
        require(bytes(_newDescription).length > 0, "Description cannot be empty");
        
        merkleTrees[_root].description = _newDescription;
        emit MerkleTreeUpdated(_root, _newDescription, msg.sender);
    }

    /**
     * @dev Removes a Merkle tree from the contract
     * @param _root The Merkle root to remove
     */
    function removeMerkleTree(bytes32 _root) external {
        require(merkleTrees[_root].isActive, "Tree does not exist");
        require(merkleTrees[_root].creator == msg.sender, "Only creator can remove");
        
        merkleTrees[_root].isActive = false;
        emit MerkleTreeRemoved(_root, msg.sender);
    }

    /**
     * @dev Verifies a Merkle proof for a given address
     * @param _root The Merkle root to verify against
     * @param _proof Array of proof elements
     * @param _claimer Address to verify
     * @return bool True if the proof is valid
     */
    function verifyProof(
        bytes32 _root,
        bytes32[] calldata _proof,
        address _claimer
    ) public view returns (bool) {
        require(merkleTrees[_root].isActive, "Invalid Merkle root");
        
        bytes32 leaf = keccak256(abi.encodePacked(_claimer));
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == _root;
    }

    /**
     * @dev Gets information about a Merkle tree
     * @param _root The Merkle root to get info for
     * @return MerkleTreeInfo The tree information
     */
    function getMerkleTreeInfo(
        bytes32 _root
    ) external view returns (MerkleTreeInfo memory) {
        require(merkleTrees[_root].isActive, "Tree does not exist");
        return merkleTrees[_root];
    }

    /**
     * @dev Checks if a Merkle root exists in the contract
     * @param _root The Merkle root to check
     * @return bool True if the root exists
     */
    function isMerkleRootValid(bytes32 _root) external view returns (bool) {
        return merkleTrees[_root].isActive;
    }

    /**
     * @dev Gets the current platform fee
     * @return uint256 Current platform fee in wei
     */
    function getPlatformFee() external view returns (uint256) {
        return platformFee;
    }

    /**
     * @dev Checks if an address is a newcomer
     * @param _user Address to check
     * @return bool True if the address is a newcomer
     */
    function isUserNewcomer(address _user) external view returns (bool) {
        return isNewcomer[_user];
    }
} 