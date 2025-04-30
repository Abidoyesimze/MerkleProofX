import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function EligibilityChecker({ merkleRoot, merkleTree }) {
  const { address: connectedAddress } = useAccount()
  const [checkAddress, setCheckAddress] = useState('')
  const [isEligible, setIsEligible] = useState(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [proof, setProof] = useState([])

  const validateAddress = (address) => {
    try {
      return ethers.isAddress(address)
    } catch (error) {
      return false
    }
  }

  const checkEligibility = async () => {
    if (!merkleRoot || !merkleTree) {
      toast.error('Eligibility checking is not available yet')
      return
    }

    const addressToCheck = checkAddress.trim().toLowerCase()
    if (!validateAddress(addressToCheck)) {
      toast.error('Invalid Ethereum address')
      return
    }

    setCheckingEligibility(true)
    try {
      const proof = merkleTree.getHexProof(ethers.keccak256(addressToCheck))
      const isValid = merkleTree.verify(proof, ethers.keccak256(addressToCheck), merkleRoot)
      
      setProof(proof)
      setIsEligible(isValid)
      
      if (isValid) {
        toast.success('Address is eligible for the airdrop!')
      } else {
        toast.error('Address is not eligible for the airdrop')
      }
    } catch (error) {
      toast.error('Error checking eligibility: ' + error.message)
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleConnectWallet = () => {
    if (connectedAddress) {
      setCheckAddress(connectedAddress)
      toast.success('Connected wallet address loaded')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Check Airdrop Eligibility</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="space-y-6">
            {/* Address Input */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={checkAddress}
                  onChange={(e) => setCheckAddress(e.target.value)}
                  placeholder="Enter address to check eligibility"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleConnectWallet}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Use Connected Wallet
                </button>
              </div>
              
              <button
                onClick={checkEligibility}
                disabled={!merkleRoot || !checkAddress || checkingEligibility}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingEligibility ? 'Checking...' : 'Check Eligibility'}
              </button>
            </div>

            {/* Results */}
            {isEligible !== null && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  isEligible ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  <div className="flex items-center gap-2">
                    {isEligible ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                    <p className={`font-semibold ${
                      isEligible ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    }`}>
                      {isEligible ? 'This address is eligible for the airdrop!' : 'This address is not eligible for the airdrop.'}
                    </p>
                  </div>
                </div>

                {isEligible && proof.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Proof</h3>
                    <code className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                      {JSON.stringify(proof, null, 2)}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 