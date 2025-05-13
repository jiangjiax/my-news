'use client'

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NFTCard from '@/components/NFTCard';
import { fetchNFTMarketplace, NFTListItem } from '@/utils/api';
import { FiGrid, FiFilter, FiSearch, FiChevronLeft, FiChevronRight, FiBox } from 'react-icons/fi';

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFTListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;
  
  // Load NFT data
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        const data = await fetchNFTMarketplace(page, pageSize);
        setNfts(data.list);
        setTotalItems(data.total);
        setLoading(false);
      } catch (err) {
        setError('Failed to load NFT marketplace data');
        setLoading(false);
      }
    };
    
    loadNFTs();
  }, [page]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-4">
              NFT Podcast Marketplace
            </h1>
            <p className="max-w-2xl mx-auto text-gray-300">
              Explore unique podcast NFT collections, support creators, and own your favorite content
            </p>
          </div>
          
          {/* Filter and search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center text-gray-300 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2">
              <button className="flex items-center px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-700/50">
                <FiGrid className="mr-2" />
                All
              </button>
              <button className="flex items-center px-4 py-2 text-gray-400 hover:text-gray-200">
                <FiFilter className="mr-2" />
                Latest
              </button>
            </div>
            
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search podcast NFTs..."
                className="w-full md:w-64 bg-gray-800/40 border border-gray-700/50 rounded-xl py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>
          
          {/* NFT grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p>{error}</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiBox className="mx-auto h-16 w-16 mb-4" />
              <p className="text-xl font-medium">No NFT items yet</p>
              <p className="mt-2">Please check back later</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map(nft => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className={`p-2 rounded-lg ${page === 1 ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                      <FiChevronLeft />
                    </button>
                    
                    <div className="px-4 py-2 text-gray-300">
                      {page} / {totalPages}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 