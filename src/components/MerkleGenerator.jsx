import { useState, useEffect } from 'react'
import { 
  TrashIcon, 
  DocumentCheckIcon, 
  ClipboardDocumentIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { generateMerkleTree as buildMerkleTree } from '../utils/merkle'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { formatEther } from 'viem'
import { 
  useMerkleRootValid, 
  usePlatformFee, 
  useIsNewcomer, 
  useMerkleTreeInfo,
  useMerkleContract
} from './useMerkleContract'

const MerkleGenerator = () => {
  const { address: connectedAddress, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // UI state
  const [addresses, setAddresses] = useState([])
  const [inputAddress, setInputAddress] = useState('')
  const [merkleRoot, setMerkleRoot] = useState('')
  const [merkleTree, setMerkleTree] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [proof, setProof] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [treeDescription, setTreeDescription] = useState('')
  const [showContractSection, setShowContractSection] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txStatus, setTxStatus] = useState('')

  // Contract read hooks
  const { isValid: merkleRootValid, isLoading: rootCheckLoading } = useMerkleRootValid(merkleRoot)
  const { fee: platformFee, isLoading: feeLoading } = usePlatformFee()
  const { isNewcomer: isNewcomerStatus, isLoading: newcomerLoading } = useIsNewcomer()
  const { treeInfo: treeInfoData, isLoading: treeInfoLoading } = useMerkleTreeInfo(merkleRoot)
  
  // Contract write operations
  const { 
    addMerkleTree, 
    removeMerkleTree, 
    updateTreeDescription,
    isLoading: isContractLoading 
  } = useMerkleContract()
  
  // Format tree info
  const formattedTreeInfo = treeInfoData || null
  
  // Check if any operation is loading
  const isPageLoading = isLoading || isContractLoading || rootCheckLoading || 
                        feeLoading || newcomerLoading || treeInfoLoading

  const validateAddress = (address) => {
    try {
      return ethers.isAddress(address.toLowerCase())
    } catch (error) {
      return false
    }
  }

  const handleAddAddress = () => {
    if (!inputAddress.trim()) {
      toast.error('Please enter an address')
      return
    }

    const normalizedAddress = inputAddress.trim().toLowerCase()
    if (!validateAddress(normalizedAddress)) {
      toast.error('Invalid Ethereum address')
      return
    }

    if (addresses.includes(normalizedAddress)) {
      toast.warning('Address already added')
      return
    }

    setAddresses(prevAddresses => {
      const newAddresses = [...prevAddresses, normalizedAddress]
      generateMerkleTree(newAddresses)
      return newAddresses
    })
    setInputAddress('')
    toast.success('Address added successfully')
  }

  const handleRemoveAddress = (addressToRemove) => {
    setAddresses(prevAddresses => {
      const newAddresses = prevAddresses.filter(addr => addr !== addressToRemove)
      generateMerkleTree(newAddresses)
      return newAddresses
    })
    toast.info('Address removed')
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        Papa.parse(text, {
          complete: (results) => {
            const lines = results.data
              .flat()
              .map(line => typeof line === 'string' ? line.trim() : String(line).trim())
              .filter(line => line)
              .map(line => line.toLowerCase())

            const validAddresses = lines.filter(validateAddress)
            const invalidAddresses = lines.filter(addr => !validateAddress(addr) && addr.length > 0)

            if (validAddresses.length > 0) {
              setAddresses(prevAddresses => {
                const newAddresses = [...new Set([...prevAddresses, ...validAddresses])]
                generateMerkleTree(newAddresses)
                return newAddresses
              })
              toast.success(`Added ${validAddresses.length} valid addresses`)
            }

            if (invalidAddresses.length > 0) {
              toast.error(`Found ${invalidAddresses.length} invalid addresses`)
            }
          },
          error: (error) => {
            toast.error('Error parsing file: ' + error.message)
          }
        })
      } catch (error) {
        toast.error('Error processing file')
        console.error(error)
      } finally {
        setIsLoading(false)
        event.target.value = ''
      }
    }
    
    reader.onerror = () => {
      toast.error('Error reading file')
      setIsLoading(false)
      event.target.value = ''
    }
    
    reader.readAsText(file)
  }

  const handlePasteAddresses = (event) => {
    const text = event.target.value
    const lines = text.split(/[\n,]/) // Split by newlines or commas
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.toLowerCase())

    const validAddresses = lines.filter(validateAddress)
    const invalidAddresses = lines.filter(addr => !validateAddress(addr) && addr.length > 0)

    if (validAddresses.length > 0) {
      setAddresses(prevAddresses => {
        const newAddresses = [...new Set([...prevAddresses, ...validAddresses])]
        generateMerkleTree(newAddresses)
        return newAddresses
      })
      toast.success(`Added ${validAddresses.length} valid addresses`)
    } else {
      toast.warning("No valid addresses found in pasted text")
    }

    if (invalidAddresses.length > 0) {
      toast.error(`Found ${invalidAddresses.length} invalid addresses`)
    }

    event.target.value = ''
  }

  const generateMerkleTree = (addressList) => {
    if (!addressList || addressList.length === 0) {
      setMerkleTree(null)
      setMerkleRoot('')
      return null
    }

    try {
      const tree = buildMerkleTree(addressList)
      setMerkleTree(tree)
      setMerkleRoot(tree.getHexRoot())
      return tree
    } catch (error) {
      toast.error('Error generating Merkle tree')
      console.error(error)
      return null
    }
  }

  const handleGenerateProof = (address) => {
    if (!merkleTree || !address) return
    
    try {
      const proof = merkleTree.getHexProof(ethers.keccak256(address))
      setProof(proof)
      setSelectedAddress(address)
      toast.success('Proof generated successfully')
    } catch (error) {
      toast.error('Error generating proof')
      console.error(error)
    }
  }

  const downloadProof = () => {
    if (!proof.length) return

    const proofData = {
      address: selectedAddress,
      proof: proof,
      merkleRoot: merkleRoot
    }

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' })
    saveAs(blob, `merkle-proof-${selectedAddress.slice(0, 8)}.json`)
    toast.success('Proof downloaded successfully')
  }

  const downloadAllData = () => {
    if (!merkleTree || !addresses.length) return

    const allData = {
      merkleRoot,
      addresses,
      proofs: addresses.map(address => ({
        address,
        proof: merkleTree.getHexProof(ethers.keccak256(address))
      }))
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    saveAs(blob, `merkle-tree-data.json`)
    toast.success('All data downloaded successfully')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Contract interaction handlers
  const handlePublishMerkleRoot = async () => {
    if (!merkleRoot || !addresses.length || !treeDescription) {
      toast.error("Missing required information to publish Merkle root")
      return
    }
    
    try {
      setTxStatus('pending')
      // Fee calculation - if newcomer, fee is 0
      const fee = isNewcomerStatus ? 0n : (platformFee || 0n)
      
      const hash = await addMerkleTree(merkleRoot, treeDescription, addresses.length, fee)
      setTxHash(hash)
      setTxStatus('confirmed')
      toast.success("Merkle root successfully published to the blockchain!")
    } catch (error) {
      console.error("Error publishing Merkle root:", error)
      setTxStatus('failed')
      
      // User-friendly error messages
      if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected")
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds in your wallet")
      } else {
        toast.error(`Error: ${error.message || "Transaction failed"}`)
      }
    }
  }
  
  const handleRemoveMerkleRoot = async () => {
    if (!merkleRoot) {
      toast.error("No Merkle root selected")
      return
    }
    
    if (!merkleRootValid) {
      toast.error("This Merkle root is not registered in the contract")
      return
    }
    
    if (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress) {
      toast.error("Only the creator can remove this Merkle tree")
      return
    }
    
    if (window.confirm("Are you sure you want to remove this Merkle tree? This action cannot be undone.")) {
      try {
        setTxStatus('pending')
        const hash = await removeMerkleTree(merkleRoot)
        setTxHash(hash)
        setTxStatus('confirmed')
        toast.success("Merkle root successfully removed from the blockchain!")
      } catch (error) {
        console.error("Error removing Merkle root:", error)
        setTxStatus('failed')
        
        if (error.message?.includes("user rejected")) {
          toast.error("Transaction was rejected")
        } else {
          toast.error(`Error: ${error.message || "Transaction failed"}`)
        }
      }
    }
  }
  
  const handleUpdateDescription = async () => {
    if (!merkleRoot || !treeDescription) {
      toast.error("Please provide a new description")
      return
    }
    
    if (!merkleRootValid) {
      toast.error("This Merkle root is not registered in the contract")
      return
    }
    
    if (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress) {
      toast.error("Only the creator can update this Merkle tree's description")
      return
    }
    
    try {
      setTxStatus('pending')
      const hash = await updateTreeDescription(merkleRoot, treeDescription)
      setTxHash(hash)
      setTxStatus('confirmed')
      toast.success("Merkle tree description successfully updated!")
    } catch (error) {
      console.error("Error updating description:", error)
      setTxStatus('failed')
      
      if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected")
      } else {
        toast.error(`Error: ${error.message || "Transaction failed"}`)
      }
    }
  }

  // Format timestamp to date
  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    try {
      return new Date(timestamp * 1000).toLocaleString()
    } catch (error) {
      return ""
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MerkleProofX Generator</h2>
          
          {/* Wallet Connection */}
          <div>
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {connectedAddress?.slice(0, 6)}...{connectedAddress?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Generate Merkle proofs for your whitelist, airdrop, or any other permissioned system. Upload addresses, get your Merkle root and proofs.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <CodeBracketIcon className="h-5 w-5" />
            Developer Note
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Use the Merkle root in your smart contract. Users can later submit their proof to verify eligibility. This saves gas by not storing the entire list on-chain.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload Addresses</h3>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-100
                dark:text-gray-400"
              disabled={isPageLoading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a CSV or TXT file with one address per line
            </p>
          </div>
        </div>

        {/* Paste Addresses Section */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Multiple Addresses</h3>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                placeholder="Paste addresses here (one per line or comma-separated)"
                onChange={handlePasteAddresses}
                className="block w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                disabled={isPageLoading}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Address Input Section */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Single Address</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder="Enter Ethereum address"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              disabled={isPageLoading}
            />
            <button
              onClick={handleAddAddress}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isPageLoading || !inputAddress.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* Address List Section */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Addresses List</h3>
          {addresses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No addresses added yet</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Addresses: <span className="font-semibold">{addresses.length}</span>
                </p>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all addresses?")) {
                      setAddresses([]);
                      setMerkleTree(null);
                      setMerkleRoot('');
                      setProof([]);
                      setSelectedAddress('');
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  disabled={isPageLoading}
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {addresses.map((address) => (
                    <li key={address} className="p-3 flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      <span className="text-gray-600 dark:text-gray-200 font-mono truncate max-w-xs">{address}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRemoveAddress(address)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700"
                          title="Remove Address"
                          disabled={isPageLoading}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleGenerateProof(address)}
                          className="text-green-600 dark:text-green-400 hover:text-green-700"
                          title="Generate Proof"
                          disabled={isPageLoading}
                        >
                          <DocumentCheckIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Merkle Root Display */}
        {merkleRoot && (
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Merkle Root</h3>
            <div className="flex items-center space-x-2 overflow-x-auto mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded">
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{merkleRoot}</span>
              <button
                onClick={() => copyToClipboard(merkleRoot)}
                className="text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0"
                title="Copy to Clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Root Status & Contract Interaction Section */}
            {isConnected && (
              <div className="space-y-4">
                {/* Root status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Blockchain Status</h4>
                  
                  {rootCheckLoading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Checking root status...</p>
                  ) : merkleRootValid ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span>Root is registered on-chain</span>
                      </div>
                      
                      {formattedTreeInfo && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <p><span className="font-medium">Description:</span> {formattedTreeInfo.description}</p>
                          <p><span className="font-medium">Creator:</span> {formattedTreeInfo.creator?.slice(0, 6)}...{formattedTreeInfo.creator?.slice(-4)}</p>
                          <p><span className="font-medium">Size:</span> {formattedTreeInfo.listSize} addresses</p>
                          <p><span className="font-medium">Created:</span> {formatDate(formattedTreeInfo.timestamp)}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      <span>Root is not yet registered on-chain</span>
                    </div>
                  )}
                </div>
                
                {/* Contract interaction buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowContractSection(!showContractSection)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showContractSection ? "Hide Contract Options" : "Manage on Blockchain"}
                  </button>
                </div>
                
                {/* Contract interaction section */}
                {showContractSection && (
                  <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-200">Blockchain Operations</h4>
                    
                    {/* Description input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tree Description
                      </label>
                      <input
                        type="text"
                        value={treeDescription}
                        onChange={(e) => setTreeDescription(e.target.value)}
                        placeholder="e.g., NFT Whitelist Phase 1"
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        disabled={isPageLoading}
                      />
                    </div>
                    
                    {/* Fee info */}
                    {platformFee && BigInt(platformFee) > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Platform Fee:</span> {platformFee ? formatEther(platformFee) : '0'} ETH
                          {isNewcomerStatus && (
                            <span className="ml-2 text-green-600 dark:text-green-400">(First tree is free!)</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Publish button */}
                      <button
                        onClick={handlePublishMerkleRoot}
                        disabled={isPageLoading || !merkleRoot || !treeDescription || merkleRootValid}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isContractLoading ? "Processing..." : "Publish Root"}
                      </button>
                      
                      {/* Update button */}
                      <button
                        onClick={handleUpdateDescription}
                        disabled={isPageLoading || !merkleRoot || !treeDescription || !merkleRootValid || (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isContractLoading ? "Processing..." : "Update Description"}
                      </button>
                      
                      {/* Remove button */}
                      <button
                        onClick={handleRemoveMerkleRoot}
                        disabled={isPageLoading || !merkleRoot || !merkleRootValid || (formattedTreeInfo && formattedTreeInfo.creator !== connectedAddress)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isContractLoading ? "Processing..." : "Remove Root"}
                      </button>
                    </div>
                    
                    {/* Transaction status */}
                    {txHash && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-700 dark:text-blue-300 break-all">
                          <span className="font-medium">Transaction Hash:</span> {txHash}
                        </p>
                        <p className="mt-1 text-blue-700 dark:text-blue-300">
                          <span className="font-medium">Status:</span> {txStatus}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Proof Generation Section */}
        {proof.length > 0 && (
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Merkle Proof for {selectedAddress.slice(0, 6)}...{selectedAddress.slice(-4)}
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-white">{JSON.stringify(proof, null, 2)}</pre>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(proof, null, 2))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Proof
                </button>
                <button
                  onClick={downloadProof}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download Proof
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download All Data Button */}
        {addresses.length > 0 && (
          <div className="mt-6">
            <button
              onClick={downloadAllData}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              disabled={isPageLoading}
            >
              Download All Data (Merkle Root + All Proofs)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MerkleGenerator