import { Link } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  DocumentCheckIcon,
  CubeIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  BoltIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Easy Upload',
    description: 'Upload your address list via CSV or paste directly into the interface.',
    icon: ArrowUpTrayIcon
  },
  {
    title: 'Instant Generation',
    description: 'Generate Merkle proofs instantly for any address in your list.',
    icon: BoltIcon
  },
  {
    title: 'Gas Efficient',
    description: 'Save on gas costs by using Merkle proofs instead of storing full lists on-chain.',
    icon: ChartBarIcon
  },
  {
    title: 'Developer Friendly',
    description: 'Simple integration with your smart contracts using standard Merkle proof verification.',
    icon: CodeBracketIcon
  },
  {
    title: 'Scalable',
    description: 'Handle thousands of addresses efficiently with Merkle tree structure.',
    icon: ScaleIcon
  },
  {
    title: 'Time Saving',
    description: 'Generate all necessary proofs in seconds, ready for your smart contract.',
    icon: ClockIcon
  }
];

const useCases = [
  {
    title: 'Airdrops',
    description: 'Efficiently distribute tokens to multiple addresses without storing the full list on-chain.'
  },
  {
    title: 'Whitelists',
    description: 'Create permissioned access for NFT mints, token sales, or special events.'
  },
  {
    title: 'Claims',
    description: 'Set up efficient claim systems for rewards, refunds, or special benefits.'
  },
  {
    title: 'Voting',
    description: 'Implement permissioned voting systems for DAOs or governance protocols.'
  }
];

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-6">
          Generate Merkle Proofs for Your Web3 Project
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Create efficient whitelists, airdrops, and permissioned systems with Merkle proofs
        </p>
        <Link
          to="/generate"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Proofs
        </Link>
      </div>

      {/* Benefits Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Why Use MerkleProofX?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg dark:border-gray-700">
            <BoltIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gas Efficient</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Save thousands in gas fees by using Merkle proofs instead of storing full lists on-chain.
            </p>
          </div>
          <div className="p-6 border rounded-lg dark:border-gray-700">
            <ClockIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Time Saving</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generate all necessary proofs in seconds, ready for your smart contract.
            </p>
          </div>
          <div className="p-6 border rounded-lg dark:border-gray-700">
            <ScaleIcon className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Scalable</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Handle thousands of addresses efficiently with Merkle tree structure.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border rounded-lg dark:border-gray-700">
              <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="p-6 border rounded-lg dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
            <h3 className="font-semibold mb-2">Upload Addresses</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your list of eligible addresses
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
            <h3 className="font-semibold mb-2">Generate Tree</h3>
            <p className="text-gray-600 dark:text-gray-300">
              We create a Merkle tree from your addresses
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
            <h3 className="font-semibold mb-2">Get Root</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Receive the Merkle root for your smart contract
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
            <h3 className="font-semibold mb-2">Download Proofs</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get individual proofs for each address
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Generate your first Merkle proof in seconds
        </p>
        <Link
          to="/generate"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Proofs Now
        </Link>
      </div>
    </div>
  );
};

export default Home; 