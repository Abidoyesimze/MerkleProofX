import { Link } from 'react-router-dom'
import { ArrowRightIcon, ShieldCheckIcon, DocumentCheckIcon, CubeIcon, ChartBarIcon, CodeBracketIcon, ArrowPathIcon, BoltIcon, ClockIcon, ScaleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Logo from './Logo'

export default function LandingPage() {
  const features = [
    {
      name: 'Gas Efficient',
      description: 'Save thousands in gas fees by using Merkle proofs instead of storing full lists on-chain.',
      icon: BoltIcon,
      color: 'from-purple-100 to-purple-200 dark:from-purple-500/20 dark:to-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 hover:border-purple-300 dark:border-purple-900/20 dark:hover:border-purple-500/50',
      shadowColor: 'hover:shadow-purple-200/50 dark:hover:shadow-purple-500/10',
    },
    {
      name: 'Time Saving',
      description: 'Generate all necessary proofs in seconds, ready for your smart contract.',
      icon: ClockIcon,
      color: 'from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-900/20 dark:hover:border-blue-500/50',
      shadowColor: 'hover:shadow-blue-200/50 dark:hover:shadow-blue-500/10',
    },
    {
      name: 'Scalable',
      description: 'Handle thousands of addresses efficiently with Merkle tree structure.',
      icon: ScaleIcon,
      color: 'from-violet-100 to-violet-200 dark:from-violet-500/20 dark:to-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-200 hover:border-violet-300 dark:border-violet-900/20 dark:hover:border-violet-500/50',
      shadowColor: 'hover:shadow-violet-200/50 dark:hover:shadow-violet-500/10',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.3,
      },
    },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0a0f1d] dark:via-[#111827] dark:to-[#0a0f1d]"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold mb-8 text-gray-900 dark:text-white"
            >
              Generate Merkle Proofs
              <br />
              <span className="text-violet-600 dark:text-violet-400">for Your Web3 Project</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              Create efficient whitelists, airdrops, and permissioned systems with Merkle proofs
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.6, duration: 0.2 }}
            >
              <Link
                to="/generate"
                className="inline-flex items-center px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
              >
                Generate Proofs
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Why Use Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-[#111827] dark:via-[#0f1729] dark:to-[#0a0f1d]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white"
          >
            Why Use MerkleProofX?
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                whileHover="hover"
                custom={index}
                className={`relative p-8 rounded-xl bg-gradient-to-b ${feature.color} backdrop-blur-sm border ${feature.borderColor} transition-all duration-300 group ${feature.shadowColor} hover:shadow-lg`}
              >
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`absolute -top-4 -left-4 p-3 rounded-lg bg-gradient-to-br ${feature.color} backdrop-blur-sm group-hover:bg-opacity-70 transition-colors duration-300`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-4 text-gray-900 dark:text-white mt-4"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.name}
                </motion.h3>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-[#0a0f1d] dark:via-[#111827] dark:to-[#0a0f1d]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold mb-8 text-gray-900 dark:text-white"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.2 }}
          >
            <Link
              to="/generate"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
            >
              Start Generating Proofs
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
} 