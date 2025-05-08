'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchNFTDetail, NFTDetail } from '@/utils/api';
import { FiArrowLeft, FiHeadphones, FiDownload, FiTag, FiBox, FiShoppingCart, FiInfo, FiFileText, FiChevronDown, FiChevronUp, FiClock, FiVolume2, FiVolumeX, FiPause, FiPlay } from 'react-icons/fi';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  
  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullScript, setShowFullScript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // 加载NFT详情
  useEffect(() => {
    const loadNFTDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchNFTDetail(id);
        setNft(data);
        setLoading(false);
      } catch (err) {
        setError('加载NFT详情失败');
        setLoading(false);
      }
    };
    
    if (id) {
      loadNFTDetail();
    }
  }, [id]);
  
  // 监听音频进度
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setAudioProgress(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [nft?.audioUrl]);
  
  // 拖动进度条
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setAudioProgress(value);
  };
  
  // 播放/暂停
  const handlePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  
  // 音频播放结束时重置播放状态
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);
  
  // 格式化时间
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // 格式化脚本
  const formatScript = (script: any) => {
    if (!script) return [];
    
    // 检查 script 是否已经是对象
    if (typeof script === 'object' && script.contents) {
      return script.contents;
    }
    
    // 如果是字符串，尝试解析
    try {
      const parsedScript = typeof script === 'string' ? JSON.parse(script) : script;
      return parsedScript.contents || [];
    } catch (err) {
      console.error('脚本解析错误:', err);
      return [];
    }
  };
  
  // 返回上一页
  const handleBack = () => {
    router.back();
  };
  
  // 处理购买NFT
  const handleBuyNFT = () => {
    alert('购买功能正在开发中');
  };
  
  // 音量变化
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 音量滑块处理
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (value === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  // 静音切换
  const handleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // 下载音频
  const handleDownload = () => {
    if (!nft?.audioUrl) return;
    const url = nft.audioUrl.startsWith('http') ? nft.audioUrl : `http://81.68.194.175:8090${nft.audioUrl}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nft.podcastName || 'podcast'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 返回按钮 */}
          <button 
            onClick={handleBack}
            className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            返回市场
          </button>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">
              <p>{error}</p>
            </div>
          ) : nft ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧 - 播客封面和音频播放 */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
                  {/* 播客封面 */}
                  <div className="h-64 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white mb-2">
                        {nft.podcastName}
                      </div>
                      <div className="text-sm text-gray-300">
                        {nft.episodeName}
                      </div>
                    </div>
                  </div>
                  
                  {/* 自定义音频播放器 */}
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-4">
                      <div className="flex items-center gap-4 mb-2">
                        {/* 播放/暂停 */}
                        <button
                          onClick={handlePlayAudio}
                          disabled={!nft.audioUrl}
                          className={`w-14 h-14 rounded-full flex items-center justify-center 
                            bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg
                            hover:from-blue-700 hover:to-purple-700 transition-all duration-200
                            ${isPlaying ? 'ring-2 ring-purple-400/40' : ''}`}
                        >
                          {isPlaying ? (
                            <FiPause className="w-7 h-7 text-white" />
                          ) : (
                            <FiPlay className="w-8 h-8 text-white" style={{ marginLeft: '5px' }} />
                          )}
                        </button>
                        {/* 下载按钮 */}
                        <button
                          onClick={handleDownload}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 border border-gray-700/60 hover:bg-blue-900/40 hover:border-blue-600 transition-all duration-200"
                          title="下载音频"
                        >
                          <FiDownload className="w-5 h-5 text-blue-300" />
                        </button>
                      </div>
                      {/* 进度条 */}
                      <div className="w-full mt-2">
                        <input
                          type="range"
                          min={0}
                          max={audioDuration || 0}
                          step={0.01}
                          value={audioProgress}
                          onChange={handleSeek}
                          className="w-full accent-blue-500"
                          style={{
                            background: 'linear-gradient(to right, #3b82f6 0%, #a78bfa 100%)',
                            height: '4px',
                            borderRadius: '2px',
                            appearance: 'none',
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(audioProgress)}</span>
                          <span>{formatTime(audioDuration)}</span>
                        </div>
                      </div>
                      {/* 音量控制 */}
                      <div className="flex items-center gap-2 w-full mt-4">
                        <button
                          onClick={handleMute}
                          className="p-2 rounded-full bg-gray-800/80 border border-gray-700/60 hover:bg-blue-900/40 hover:border-blue-600 transition-all duration-200"
                          title={isMuted || volume === 0 ? "取消静音" : "静音"}
                        >
                          {isMuted || volume === 0 ? (
                            <FiVolumeX className="w-5 h-5 text-blue-300" />
                          ) : (
                            <FiVolume2 className="w-5 h-5 text-blue-300" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="flex-1 accent-blue-500"
                          style={{
                            background: 'linear-gradient(to right, #3b82f6 0%, #a78bfa 100%)',
                            height: '4px',
                            borderRadius: '2px',
                            appearance: 'none',
                          }}
                        />
                      </div>
                      {/* 隐藏原生 audio 控件，仅用于播放 */}
                      <audio
                        ref={audioRef}
                        src={nft.audioUrl && (nft.audioUrl.startsWith('http') ? nft.audioUrl : `http://81.68.194.175:8090${nft.audioUrl}`)}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          创建于 {formatDate(nft.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* NFT 信息 */}
                <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <FiInfo className="mr-2" />
                    NFT 信息
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">价格</span>
                      <span className="font-bold text-white">{nft.nftPrice} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">总供应量</span>
                      <span className="text-white">{nft.nftSupply}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">已售数量</span>
                      <span className="text-white">{nft.nftSold} / {nft.nftSupply}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">发行日期</span>
                      <span className="text-white">{formatDate(nft.createdAt)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleBuyNFT}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    <FiShoppingCart className="mr-2" />
                    购买 NFT
                  </button>
                </div>
              </div>
              
              {/* 右侧 - 播客详情和脚本 */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{nft.podcastName}</h2>
                  <h3 className="text-xl text-blue-300 mb-4">{nft.episodeName}</h3>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-line">{nft.showNote}</p>
                  </div>
                </div>
                
                {/* 脚本内容 */}
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <FiFileText className="mr-2" />
                      播客脚本
                    </h3>
                    <button 
                      onClick={() => setShowFullScript(!showFullScript)}
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      {showFullScript ? (
                        <>
                          收起 <FiChevronUp className="ml-1" />
                        </>
                      ) : (
                        <>
                          展开全部 <FiChevronDown className="ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {nft.script && formatScript(nft.script).map((line: any, index: number) => {
                      // 如果不显示全部且超过5行，则隐藏
                      if (!showFullScript && index > 4) return null;
                      
                      return (
                        <div key={index} className="flex flex-col gap-2">
                          <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-900/40 border border-blue-700/40 rounded-xl">
                            <FiHeadphones className="w-5 h-5 text-blue-400" />
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-blue-300 font-medium">
                                {line.speakerName}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-blue-800/60 text-blue-200 rounded-md border border-blue-700/40">
                                主播
                              </span>
                            </div>
                          </div>
                          <div className="px-5 py-3 bg-gray-900/60 text-gray-300 rounded-xl border border-gray-700/40">
                            {line.content}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* 如果超过5行且未展开全部，显示查看更多提示 */}
                    {!showFullScript && nft.script && formatScript(nft.script).length > 5 && (
                      <div 
                        onClick={() => setShowFullScript(true)}
                        className="text-center py-4 text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        查看更多内容...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 