import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  arbitrumSepolia,
  baseSepolia,
  polygon,
  optimism,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import MerkleGenerator from './components/MerkleGenerator';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const config = getDefaultConfig({
  appName: 'MerkleProofX',
  projectId: 'YOUR_PROJECT_ID',
  chains: [arbitrumSepolia, baseSepolia, polygon, optimism],
  ssr: true,
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/generate" element={<MerkleGenerator />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </Layout>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App; 