import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from '../components/SolanaWalletProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'MyNews - AI 驱动的 Web3 播客创作平台',
  description: '将任何信息源转化为专业播客内容，通过 Web3 技术确权变现',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaWalletProvider>
      <html lang="zh-CN">
        <body className="bg-gray-900 text-gray-100 min-h-screen">
          {children}
        </body>
      </html>
    </SolanaWalletProvider>
  );
}
