import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const Layout = ({ children }) => {
  const { isConnected } = useAccount()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/generate' && !isConnected) {
      toast.error('Please connect your wallet to access this feature')
      navigate('/')
    }
  }, [location.pathname, isConnected, navigate])

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white">
      {/* Navigation */}
      <nav className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Logo />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} MerkleProofX. All rights reserved.
          </p>
        </div>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default Layout 