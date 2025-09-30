import React, { useState, useCallback, useEffect } from 'react';
import UniversalProvider from '@walletconnect/universal-provider';
import { WalletConnectModal } from '@walletconnect/modal';
import LoadingSpinner from './LoadingSpinner';

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

// Get project ID from environment or use the one from backend .env
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '6c564386b682b9904553858861e46773';

console.log('[WalletConnect] Module loaded, Project ID:', projectId);

// Singleton instances to prevent multiple initializations
let providerInstance: any = null;
let modalInstance: WalletConnectModal | null = null;
let initializationPromise: Promise<any> | null = null;

const getProvider = async () => {
  console.log('[WalletConnect] getProvider called');
  
  // If already initialized, return it
  if (providerInstance) {
    console.log('[WalletConnect] Returning existing provider instance');
    return providerInstance;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[WalletConnect] Waiting for initialization in progress...');
    return initializationPromise;
  }

  // Start initialization
  console.log('[WalletConnect] Starting new provider initialization...');
  initializationPromise = UniversalProvider.init({
    projectId,
    metadata: {
      name: 'Queue Skip Web3',
      description: 'Multi-tenant queue management with Web3',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`]
    }
  }).then((provider) => {
    console.log('[WalletConnect] Provider initialized successfully!');
    providerInstance = provider;
    initializationPromise = null;
    return provider;
  }).catch((error) => {
    console.error('[WalletConnect] Provider initialization FAILED:', error);
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
};

const getModal = () => {
  if (!modalInstance) {
    console.log('[WalletConnect] Creating WalletConnect modal...');
    modalInstance = new WalletConnectModal({
      projectId,
      chains: ['eip155:1'], // Ethereum mainnet
      themeMode: 'light',
      themeVariables: {
        '--wcm-z-index': '9999'
      }
    });
    console.log('[WalletConnect] Modal created');
  }
  return modalInstance;
};

const WalletConnectComponent: React.FC<WalletConnectProps> = ({ 
  onConnect, 
  onError, 
  disabled = false 
}) => {
  const [connecting, setConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [provider, setProvider] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize provider once
  useEffect(() => {
    console.log('[WalletConnect] useEffect - Initializing provider...');
    
    getProvider()
      .then((p) => {
        console.log('[WalletConnect] Provider ready, setting state');
        setProvider(p);
        setInitializing(false);
        
        // Check if already connected
        if (p.session) {
          const accounts = p.session?.namespaces?.eip155?.accounts;
          if (accounts && accounts.length > 0) {
            const address = accounts[0].split(':')[2];
            console.log('[WalletConnect] Auto-connecting to existing session:', address);
            setConnectedAddress(address);
            onConnect(address);
          }
        } else {
          console.log('[WalletConnect] No existing session found');
        }
      })
      .catch((error) => {
        console.error('[WalletConnect] Provider initialization error:', error);
        setInitializing(false);
        onError('Failed to initialize WalletConnect: ' + error.message);
      });
  }, [onConnect, onError]);

  const connectWallet = useCallback(async () => {
    console.log('[WalletConnect] connectWallet called');
    
    if (!provider) {
      console.error('[WalletConnect] No provider available!');
      onError('WalletConnect not initialized');
      return;
    }

    const modal = getModal();

    try {
      console.log('[WalletConnect] Setting connecting state to true');
      setConnecting(true);

      // Listen for display_uri event and open the modal
      console.log('[WalletConnect] Setting up display_uri listener...');
      provider.on('display_uri', (uri: string) => {
        console.log('[WalletConnect] display_uri event received, opening modal with URI');
        modal.openModal({ uri });
      });

      console.log('[WalletConnect] Calling provider.connect()...');
      
      const session = await provider.connect({
        namespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
            ],
            chains: ['eip155:1'], // Ethereum mainnet
            events: ['chainChanged', 'accountsChanged'],
            rpcMap: {
              1: 'https://eth.llamarpc.com',
            }
          }
        },
      });
      
      console.log('[WalletConnect] provider.connect() returned session:', session);

      // Close the modal
      modal.closeModal();

      if (session) {
        console.log('[WalletConnect] Session exists, extracting accounts...');
        const accounts = provider.session?.namespaces?.eip155?.accounts;
        console.log('[WalletConnect] Accounts from session:', accounts);
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0].split(':')[2];
          console.log('[WalletConnect] Extracted address:', address);
          setConnectedAddress(address);
          onConnect(address);
          console.log('[WalletConnect] Connection successful!');
        } else {
          console.error('[WalletConnect] No accounts found in session');
          onError('No accounts found');
        }
      } else {
        console.error('[WalletConnect] Session is null/undefined');
        onError('Failed to establish session');
      }
    } catch (error: any) {
      console.error('[WalletConnect] Connection error:', error);
      
      modal.closeModal();
      
      if (error.message?.includes('User rejected') || error.message?.includes('User disapproved') || error.message?.includes('User closed modal')) {
        console.log('[WalletConnect] User rejected connection');
        onError('Connection rejected by user');
      } else {
        console.log('[WalletConnect] Error:', error.message);
        onError(error.message || 'Failed to connect wallet');
      }
    } finally {
      console.log('[WalletConnect] Setting connecting state to false');
      setConnecting(false);
      
      // Clean up event listener
      if (provider) {
        provider.removeAllListeners('display_uri');
      }
    }
  }, [provider, onConnect, onError]);

  const disconnectWallet = useCallback(async () => {
    console.log('[WalletConnect] disconnectWallet called');
    if (provider) {
      try {
        console.log('[WalletConnect] Calling provider.disconnect()...');
        await provider.disconnect();
        console.log('[WalletConnect] Disconnected successfully');
        setConnectedAddress('');
      } catch (error) {
        console.error('[WalletConnect] Disconnect error:', error);
      }
    }
  }, [provider]);

  return (
    <div className="space-y-4">
      {!connectedAddress ? (
        <>
          <button
            onClick={connectWallet}
            disabled={disabled || connecting || initializing}
            className="w-full btn btn-primary flex items-center justify-center"
          >
            {connecting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : initializing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Initializing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
          
          <div className="text-xs text-gray-500 text-center">
            <p>✅ WalletConnect Protocol v2</p>
            <p className="mt-1">Supports: MetaMask, Trust, Rainbow, Coinbase & more</p>
            {initializing && <p className="text-blue-600 mt-1">⏳ Setting up...</p>}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Wallet Connected
                </p>
                <p className="text-xs text-green-600">
                  {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="w-full btn btn-secondary text-sm"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectComponent;