export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transform rotate-45" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white dark:bg-gray-900 rounded-full" />
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        MerkleProofX
      </span>
    </div>
  )
} 