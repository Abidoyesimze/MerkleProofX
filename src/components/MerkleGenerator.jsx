import { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, ArrowUpTrayIcon, DocumentCheckIcon, ClipboardDocumentIcon, CheckCircleIcon, XCircleIcon, CodeBracketIcon } from '@heroicons/react/24/outline'
import { generateMerkleTree, generateMerkleProof, verifyMerkleProof } from '../utils/merkle'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { useAccount } from 'wagmi'

const MerkleGenerator = () => {
  const { address: connectedAddress } = useAccount()
  const [addresses, setAddresses] = useState([])
  const [inputAddress, setInputAddress] = useState('')
  const [merkleRoot, setMerkleRoot] = useState('')
  const [merkleTree, setMerkleTree] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [proof, setProof] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState('')

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
              .map(line => line.trim())
              .filter(line => line)
              .map(line => line.toLowerCase())

            const validAddresses = lines.filter(validateAddress)
            const invalidAddresses = lines.filter(addr => !validateAddress(addr))

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
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => line.toLowerCase())

    const validAddresses = lines.filter(validateAddress)
    const invalidAddresses = lines.filter(addr => !validateAddress(addr))

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

    event.target.value = ''
  }

  const generateMerkleTree = (addresses) => {
    if (!addresses.length) {
      setMerkleTree(null)
      setMerkleRoot('')
      return
    }

    try {
      const tree = generateMerkleTree(addresses)
      setMerkleTree(tree)
      setMerkleRoot(tree.getHexRoot())
      toast.success('Merkle tree generated successfully')
    } catch (error) {
      toast.error('Error generating Merkle tree')
      console.error(error)
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Generate Merkle Proofs</h2>
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
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a CSV or TXT file with one address per line
            </p>
          </div>
        </div>

        {/* Paste Addresses Section */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Addresses</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="Enter Ethereum address"
                className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Or paste multiple addresses below:</p>
            <textarea
              className="w-full h-32 p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Paste addresses here (one per line)"
              onChange={handlePasteAddresses}
            />
          </div>
        </div>

        {/* Address List Section */}
        {addresses.length > 0 && (
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Address List ({addresses.length})
              </h3>
              <button
                onClick={downloadAllData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download All Data
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {addresses.map((addr, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{addr}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateProof(addr)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Generate Proof
                    </button>
                    <button
                      onClick={() => handleRemoveAddress(addr)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merkle Root Section */}
        {merkleRoot && (
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Merkle Root</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use this root hash in your smart contract to verify proofs.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
              <code className="break-all text-gray-900 dark:text-white">{merkleRoot}</code>
            </div>
            <button
              onClick={() => copyToClipboard(merkleRoot)}
              className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Copy Root
            </button>
          </div>
        )}

        {/* Proof Section */}
        {proof.length > 0 && (
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Merkle Proof</h3>
            <p className="mb-2 text-gray-600 dark:text-gray-300">For address: {selectedAddress}</p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
              <code className="break-all text-gray-900 dark:text-white">
                {JSON.stringify(proof, null, 2)}
              </code>
            </div>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => copyToClipboard(JSON.stringify(proof))}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Copy Proof
              </button>
              <button
                onClick={downloadProof}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Download Proof
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MerkleGenerator 