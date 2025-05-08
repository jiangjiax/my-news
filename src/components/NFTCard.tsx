import React from 'react';
import Link from 'next/link';
import { FiHeadphones, FiTag, FiBox } from 'react-icons/fi';
import { NFTListItem } from '@/utils/api';

interface NFTCardProps {
  nft: NFTListItem;
}

export default function NFTCard({ nft }: NFTCardProps) {
  // 格式化日期
  const formattedDate = new Date(nft.createdAt).toLocaleDateString();
  
  // 生成随机背景颜色 (保持一致性，基于id)
  const colors = [
    'from-blue-600/20 to-blue-800/30',
    'from-purple-600/20 to-purple-800/30',
    'from-cyan-600/20 to-cyan-800/30',
    'from-green-600/20 to-green-800/30',
    'from-pink-600/20 to-pink-800/30',
  ];
  const colorIndex = nft.id % colors.length;
  const gradientBg = colors[colorIndex];
  
  return (
    <Link href={`/marketplace/${nft.id}`}>
      <div className="group h-full bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1">
        {/* 顶部渐变区域 */}
        <div className={`h-32 bg-gradient-to-br ${gradientBg} p-6 relative`}>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="bg-gray-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700/50 text-xs text-gray-300">
                播客 NFT
              </div>
              <div className="flex items-center text-white bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400/30 text-xs">
                <FiTag className="mr-1 h-3 w-3" />
                {nft.nftPrice} SOL
              </div>
            </div>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-blue-300 transition-colors">
            {nft.podcastName}
          </h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-1">
            {nft.episodeName}
          </p>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
            {nft.summary}
          </p>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center text-xs text-gray-500">
              <FiHeadphones className="mr-1" />
              {formattedDate}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <FiBox className="mr-1" />
              {nft.nftSold} / {nft.nftSupply}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 