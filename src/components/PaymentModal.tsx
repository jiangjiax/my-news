'use client'

import React, { useState } from 'react'
import { ethers } from 'ethers'
import { FiX, FiCreditCard, FiLoader } from 'react-icons/fi'
import { Button } from './ui/Button'
import { Client, Presets } from 'userop'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: string // Amount in NERO tokens
}

const SEPOLIA_TESTNET_CONFIG = {
  chainId: '0x2b1', 
  chainName: 'Nero Testnet Chain',
  nativeCurrency: {
    name: 'NERO',
    symbol: 'NERO',
    decimals: 18
  },
  rpcUrls: ['https://rpc-testnet.nerochain.io'],
  blockExplorerUrls: ['https://testnetscan.nerochain.io']
}

const PAYMASTER_CONFIG = {
  apiKey: 'd0b4099fb4204a8cba8fb2b89294e9c9',
  paymasterAddress: '0x5a6680dFd4a77FEea0A7be291147768EaA2414ad',
  entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  NERORPCURL: 'https://rpc-testnet.nerochain.io',
  BUNDLERURL:'https://bundler-testnet.nerochain.io/'
}

// 接收方钱包地址
const RECIPIENT_ADDRESS = '0xD99dBf7b3660B0c62B1C313d85B74E8d53ACC2A0'

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, amount }: PaymentModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [daiBalance, setDaiBalance] = useState<string | null>(null)

  const connectWallet = async () => {
      if (window.ethereum.isRainbow) {
    setError('Please switch to MetaMask in your wallet extension.');
    return;
  }
    try {
      setIsConnecting(true)
      setError('')

      // 检查是否安装了MetaMask
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包')
      }

      // 请求账户访问
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      setWalletAddress(account)

      // 检查当前网络是否为Sepolia测试网
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (chainId !== SEPOLIA_TESTNET_CONFIG.chainId) {
        try {
          // 尝试切换到Sepolia测试网
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_TESTNET_CONFIG.chainId }],
          })
        } catch (switchError: any) {
          // 如果Sepolia测试网未添加到MetaMask，则尝试添加
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [SEPOLIA_TESTNET_CONFIG],
              })
            } catch (addError) {
              throw new Error('无法添加或切换到Nero测试网')
            }
          } else {
            throw new Error('无法切换到Nero测试网')
          }
        }
      }
      
      // 获取DAI余额
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const DAI_TOKEN_ADDRESS = "0xD5a6dcff7AC339A03f6964c315575bF65c3c6cF6";
        const DAI_ABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];
        
        const daiContract = new ethers.Contract(DAI_TOKEN_ADDRESS, DAI_ABI, provider);
        const balance = await daiContract.balanceOf(account);
        const decimals = await daiContract.decimals();
        
        setDaiBalance(ethers.utils.formatUnits(balance, decimals));
      } catch (error) {
        console.error("获取DAI余额失败:", error);
        setDaiBalance("0");
      }
      
    } catch (error: any) {
      console.error('连接钱包错误:', error)
      const errorMessage = error?.message || error?.toString() || 'Failed to connect wallet'
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const processPayment = async () => {
    try {
      setIsProcessing(true)
      setError('')

      if (!walletAddress) {
        throw new Error('请先连接钱包')
      }

      // 获取provider和signer (使用ethers v5 API)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const amountWei = ethers.utils.parseEther(amount)
      
      try {
        // 检查DAI代币余额
        const DAI_TOKEN_ADDRESS = "0xD5a6dcff7AC339A03f6964c315575bF65c3c6cF6";
        const DAI_ABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];
        
        const daiContract = new ethers.Contract(DAI_TOKEN_ADDRESS, DAI_ABI, provider);
        const daiBalance = await daiContract.balanceOf(walletAddress);
        const daiDecimals = await daiContract.decimals();
        
        // 检查DAI余额是否足够支付gas费用（假设至少需要0.1 DAI）
        const minRequired = ethers.utils.parseUnits("0.1", daiDecimals);
        
        if (daiBalance.lt(minRequired)) {
          throw new Error(`您的DAI代币余额不足，无法支付gas费用。需要至少0.1 DAI，当前余额: ${ethers.utils.formatUnits(daiBalance, daiDecimals)} DAI`);
        }
        
        // 更新DAI余额状态
        setDaiBalance(ethers.utils.formatUnits(daiBalance, daiDecimals));
        
        // 创建Client实例
        const client = await Client.init(PAYMASTER_CONFIG.NERORPCURL,{
          overrideBundlerRpc: PAYMASTER_CONFIG.BUNDLERURL,
          entryPoint: PAYMASTER_CONFIG.entryPoint,
        })
        
        // 创建简单账户
        const simpleAccount = await Presets.Builder.SimpleAccount.init(
          signer,
          PAYMASTER_CONFIG.NERORPCURL,
          { 
            overrideBundlerRpc: PAYMASTER_CONFIG.BUNDLERURL,
            entryPoint: PAYMASTER_CONFIG.entryPoint
          }
        )

        // 使用Paymaster API实现Type 0: Free gas转账
        const paymasterRpcUrl = 'https://paymaster-testnet.nerochain.io/'

        // Set paymaster options with API key
        simpleAccount.setPaymasterOptions({
          apikey: PAYMASTER_CONFIG.apiKey,
          rpc: paymasterRpcUrl,
          type: "1", // 使用Type 1（代币支付gas）模式
          token: "0xD5a6dcff7AC339A03f6964c315575bF65c3c6cF6" // 使用DAI代币支付gas费用
        });

        // 创建转账操作
        const transferOp = await simpleAccount.execute(
          RECIPIENT_ADDRESS, // 接收方地址
          amountWei, // 转账金额
          '0x' // 无数据
        )
        
        // 发送UserOperation
        const result = await client.sendUserOperation(transferOp, {
          onBuild: (op) => console.log('Signed UserOperation:', op)
        })
        
        console.log('UserOperation hash:', result.userOpHash)
        
        // 等待交易完成
        const receipt = await result.wait()
        console.log('Transaction hash:', receipt?.transactionHash)
        
        // 设置交易哈希
        setTransactionHash(receipt?.transactionHash || result.userOpHash)
        
        // 交易成功，调用成功回调
        onPaymentSuccess()
        onClose()
      } catch (error: any) {
        console.error('Payment failed:', error)
        
        // 提供更详细的错误信息
        let errorMessage = 'Payment failed. Please try again.'
        
        if (error.message) {
          errorMessage = error.message
        }
        
        setError(errorMessage)
      } finally {
        setIsProcessing(false)
      }
    } catch (error: any) {
      console.error('支付处理错误:', error)
      setError(error instanceof Error ? error.message : '支付处理过程中发生未知错误')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FiCreditCard className="mr-2 h-5 w-5 text-blue-400" />
            Payment Required
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              To generate a podcast, you need to pay:
            </p>
            <div className="text-3xl font-bold text-blue-400">
              {amount} NERO
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Payment will be processed using NERO Testnet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Funds will be sent to: {RECIPIENT_ADDRESS.slice(0, 6)}...{RECIPIENT_ADDRESS.slice(-4)}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!walletAddress ? (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <FiLoader className="animate-spin mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                <>
                  <FiCreditCard className="mr-2 h-4 w-4" />
                  Connect MetaMask
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Connected Wallet:</p>
                <p className="text-white font-mono text-sm">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
                {daiBalance !== null && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-400 mb-1">DAI Balance (for gas):</p>
                    <p className={`font-mono text-sm ${parseFloat(daiBalance) >= 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                      {daiBalance} DAI {parseFloat(daiBalance) < 0.1 && '(不足)'}
                    </p>
                    {parseFloat(daiBalance) < 0.1 && (
                      <p className="text-xs text-red-400 mt-1">需要至少0.1 DAI用于支付gas费用</p>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                onClick={processPayment}
                disabled={isProcessing || (daiBalance !== null && parseFloat(daiBalance) < 0.1)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="animate-spin mr-2 h-4 w-4" />
                    Processing Payment...
                  </>
                ) : daiBalance !== null && parseFloat(daiBalance) < 0.1 ? (
                  "Need More DAI Tokens"
                ) : (
                  `Pay ${amount} NERO`
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-700/30 rounded-b-2xl">
          <p className="text-xs text-gray-400 text-center">
            Powered by NERO
          </p>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}