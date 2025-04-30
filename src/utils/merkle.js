import { ethers } from 'ethers'
import { MerkleTree } from 'merkletreejs'
import { keccak256 } from 'ethers'

// Helper function to check if a string is a valid Ethereum address
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address)
  } catch (error) {
    return false
  }
}

// Helper function to sort addresses
export const sortAddresses = (addresses) => {
  return addresses.map(addr => addr.toLowerCase()).sort()
}

// Generate a Merkle tree from a list of addresses
export const generateMerkleTree = (addresses) => {
  // Convert addresses to lowercase and hash them
  const leaves = addresses.map(addr => keccak256(addr.toLowerCase()))
  // Create the Merkle tree
  return new MerkleTree(leaves, keccak256, { sortPairs: true })
}

// Generate a Merkle proof for a specific address
export const generateMerkleProof = (tree, address) => {
  const leaf = keccak256(address.toLowerCase())
  return tree.getHexProof(leaf)
}

// Verify a Merkle proof for a specific address
export const verifyMerkleProof = (root, proof, address) => {
  const leaf = keccak256(address.toLowerCase())
  return MerkleTree.verify(proof, leaf, root, keccak256)
} 