// API基础URL
const API_BASE_URL = 'http://81.68.194.175:8090';

// NFT市场列表项类型
export interface NFTListItem {
  id: number;
  podcastName: string;
  episodeName: string;
  nftPrice: string;
  nftSupply: number;
  nftSold: number;
  createdAt: string;
  summary: string;
}

// NFT详情类型
export interface NFTDetail {
  id: number;
  podcastName: string;
  episodeName: string;
  audioUrl: string;
  script?: any;
  createdAt: string;
  showNote: string;
  nftSupply: number;
  nftPrice: string;
  nftSold: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 获取NFT市场列表
export const fetchNFTMarketplace = async (page = 1, pageSize = 10): Promise<PaginatedResponse<NFTListItem>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/nft-marketplace?page=${page}&pageSize=${pageSize}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch NFT marketplace data');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch NFT marketplace data');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching NFT marketplace:', error);
    throw error;
  }
};

// 获取NFT详情
export const fetchNFTDetail = async (id: number): Promise<NFTDetail> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/nft-detail/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch NFT detail');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch NFT detail');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching NFT detail:', error);
    throw error;
  }
}; 