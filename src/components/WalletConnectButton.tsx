'use client'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { FiZap } from 'react-icons/fi'

export default function WalletConnectButton() {
  return (
    <WalletMultiButton startIcon={<FiZap className="w-5 h-5" />} />
  )
} 