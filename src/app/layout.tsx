import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from '../components/SolanaWalletProvider'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'MyNews - AI-Powered Web3 Podcast Creation Platform',
  description: 'Transform any information source into professional podcast content, with ownership and monetization secured through Web3 technology.',
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
