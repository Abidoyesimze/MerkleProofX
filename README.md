# MerkleProofX 🌳

MerkleProofX is a powerful Web3 platform that simplifies the process of generating and managing Merkle proofs for blockchain applications. Whether you're implementing NFT whitelists, token airdrops, or DAO voting systems, MerkleProofX provides an intuitive interface and robust tools to streamline your workflow.

## ✨ Features

- 📝 Upload addresses via text input or file upload
- 🌲 Generate Merkle roots and proofs with one click
- 🔍 Verify address eligibility on-chain
- 🔒 Admin panel for managing whitelists
- 🎨 Modern, responsive UI with dark mode support
- ⚡ Gas-efficient smart contract integration
- 🛡️ Built-in address validation and security checks

## 🔧 How It Works

1. **Upload Addresses**: Add addresses through the admin panel via text input or file upload.
2. **Generate Merkle Root**: The platform automatically generates a Merkle root from the uploaded addresses.
3. **Deploy Contract**: Use our verifier contract or integrate the Merkle root into your own smart contract.
4. **Generate Proofs**: Users can check their eligibility and generate Merkle proofs.
5. **Verify On-chain**: Smart contracts can verify proofs against the stored Merkle root.

## 🔗 Smart Contract Integration

### Basic Verifier Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MerkleVerifier {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function verify(bytes32[] calldata proof, address account) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == merkleRoot;
    }
}
```

### Integration Examples

#### NFT Whitelist

```solidity
contract WhitelistedNFT is ERC721, MerkleVerifier {
    constructor(bytes32 _merkleRoot) ERC721("WhitelistedNFT", "WNFT") MerkleVerifier(_merkleRoot) {}

    function mint(bytes32[] calldata proof) external {
        require(verify(proof, msg.sender), "Not whitelisted");
        _mint(msg.sender, totalSupply());
    }
}
```

#### Token Airdrop

```solidity
contract MerkleAirdrop is ERC20, MerkleVerifier {
    mapping(address => bool) public claimed;

    constructor(bytes32 _merkleRoot) ERC20("AirdropToken", "AIR") MerkleVerifier(_merkleRoot) {}

    function claim(bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Already claimed");
        require(verify(proof, msg.sender), "Not eligible");
        
        claimed[msg.sender] = true;
        _mint(msg.sender, 100 * 10**decimals());
    }
}
```

#### DAO Voting Rights

```solidity
contract MerkleDAO {
    MerkleVerifier public verifier;
    
    constructor(bytes32 _merkleRoot) {
        verifier = new MerkleVerifier(_merkleRoot);
    }

    function vote(uint256 proposalId, bool support, bytes32[] calldata proof) external {
        require(verifier.verify(proof, msg.sender), "Not a member");
        // Voting logic here
    }
}
```

## 🛠️ API Reference

### Generate Merkle Root

```javascript
import { generateMerkleTree } from '@merkleproofx/utils';

const addresses = [
  '0x1234...', 
  '0x5678...'
];

const merkleTree = generateMerkleTree(addresses);
const root = merkleTree.getHexRoot();
```

### Generate Proof

```javascript
import { generateMerkleProof } from '@merkleproofx/utils';

const proof = generateMerkleProof(merkleTree, address);
```

## 📚 Best Practices

1. **Gas Efficiency**
   - Sort addresses before generating the Merkle tree
   - Use minimal proof lengths by balancing the tree
   - Implement batch claim functions for airdrops

2. **Security**
   - Always validate addresses before adding to the tree
   - Use a secure hashing function (keccak256)
   - Implement proper access control for admin functions

3. **Scalability**
   - Store Merkle roots on-chain, proofs off-chain
   - Use efficient data structures for proof storage
   - Implement pagination for large address lists

## 🚀 Development

### Prerequisites

- Node.js >= 16
- npm or yarn
- MetaMask or another Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/merkleproofx.git
cd merkleproofx
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 