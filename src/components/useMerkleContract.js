import { 
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    useAccount
  } from 'wagmi'
  import { MerkleProofContract } from './index.js'
  import { useState, useEffect } from 'react'
  
  // Hook to check if a Merkle root is registered and valid
  export function useMerkleRootValid(root) {
    const enabled = !!root && root !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  
    const { data, error, isPending } = useReadContract({
      address: MerkleProofContract.address,
      abi: MerkleProofContract.abi,
      functionName: 'isMerkleRootValid',
      args: [root || '0x0000000000000000000000000000000000000000000000000000000000000000'],
      enabled
    })
  
    return {
      isValid: data,
      isLoading: isPending,
      isError: !!error
    }
  }
  
  // Hook to get platform fee
  export function usePlatformFee() {
    const { data, error, isPending } = useReadContract({
      address: MerkleProofContract.address,
      abi: MerkleProofContract.abi,
      functionName: 'getPlatformFee'
    })
  
    return {
      fee: data,
      isLoading: isPending,
      isError: !!error
    }
  }
  
  // Hook to check if user is a newcomer (first tree is free)
  export function useIsNewcomer() {
    const { address } = useAccount()
    
    const { data, error, isPending } = useReadContract({
      address: MerkleProofContract.address,
      abi: MerkleProofContract.abi,
      functionName: 'isUserNewcomer',
      args: [address || '0x0000000000000000000000000000000000000000'],
      enabled: !!address
    })
  
    return {
      isNewcomer: data,
      isLoading: isPending,
      isError: !!error
    }
  }
  
  // Hook to get Merkle tree information
  export function useMerkleTreeInfo(root) {
    const enabled = !!root && root !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  
    const { data, error, isPending } = useReadContract({
      address: MerkleProofContract.address,
      abi: MerkleProofContract.abi,
      functionName: 'getMerkleTreeInfo',
      args: [root || '0x0000000000000000000000000000000000000000000000000000000000000000'],
      enabled
    })
  
    // Transform the data into a more usable format
    const treeInfo = data ? {
      description: data[0],
      timestamp: Number(data[1]),
      listSize: Number(data[2]),
      creator: data[3],
      isActive: data[4]
    } : null;
  
    return {
      treeInfo,
      isLoading: isPending,
      isError: !!error
    }
  }
  
  // Hook for all contract actions
  export function useMerkleContract() {
    const { address } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    
    // Contract write operations
    const { writeContractAsync, isPending: isWritePending } = useWriteContract()
    
    // Set loading state based on write operation
    useEffect(() => {
      setIsLoading(isWritePending)
    }, [isWritePending])
  
    // Add a Merkle tree
    const addMerkleTree = async (root, description, listSize, feeValue = 0n) => {
      if (!address) throw new Error("Wallet not connected")
      
      setIsLoading(true)
      try {
        const hash = await writeContractAsync({
          address: MerkleProofContract.address,
          abi: MerkleProofContract.abi,
          functionName: 'addMerkleTree',
          args: [root, description, BigInt(listSize)],
          value: feeValue
        })
        
        return hash
      } catch (error) {
        console.error("Error adding Merkle tree:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }
  
    // Remove a Merkle tree
    const removeMerkleTree = async (root) => {
      if (!address) throw new Error("Wallet not connected")
      
      setIsLoading(true)
      try {
        const hash = await writeContractAsync({
          address: MerkleProofContract.address,
          abi: MerkleProofContract.abi,
          functionName: 'removeMerkleTree',
          args: [root]
        })
        
        return hash
      } catch (error) {
        console.error("Error removing Merkle tree:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }
  
    // Update Merkle tree description
    const updateTreeDescription = async (root, newDescription) => {
      if (!address) throw new Error("Wallet not connected")
      
      setIsLoading(true)
      try {
        const hash = await writeContractAsync({
          address: MerkleProofContract.address,
          abi: MerkleProofContract.abi,
          functionName: 'updateMerkleTreeDescription',
          args: [root, newDescription]
        })
        
        return hash
      } catch (error) {
        console.error("Error updating Merkle tree description:", error)
        throw error
      } finally {
        setIsLoading(false)
      }
    }
  
    return {
      addMerkleTree,
      removeMerkleTree,
      updateTreeDescription,
      isLoading
    }
  }