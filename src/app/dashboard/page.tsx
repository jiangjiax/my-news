'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/Button'
import { 
  FiLink, FiSettings, FiPlay, FiPause,
  FiDownload, FiHeadphones, FiFileText,
  FiChevronLeft, FiInfo, FiMusic, FiBook, FiX, 
  FiClock, FiCheck, FiChevronDown, FiEdit2, FiCpu, 
  FiVolume2, FiVolumeX
} from 'react-icons/fi'

// 添加API基础URL常量
const API_BASE_URL = 'https://podx.goalachieveapp.com'

// 首先定义状态常量
const PODCAST_STATUS = {
  GENERATING: 0,
  COMPLETED: 1,
  FAILED: 2
} as const;

// 然后在判断状态时使用数字
const isPodcastGenerating = (status: number) => status === PODCAST_STATUS.GENERATING;
const isPodcastCompleted = (status: number) => status === PODCAST_STATUS.COMPLETED;

// 定义播客项类型
interface PodcastHost {
  name: string
  voice: string
}

interface PodcastItem {
  id: string
  podcastName: string
  episodeName: string
  podcastType: number
  status: number
  createdAt: string
  hosts: PodcastHost[]
  script?: string
  audioUrl?: string
  duration?: number
  showNote: string
  nftSupply: number
  nftPrice: string
}

// 添加适当的接口定义
interface ScriptLine {
  speakerName: string;
  content: string;
}

interface ScriptContent {
  contents: ScriptLine[];
}

// 缓存相关常量和工具函数
const CACHE_KEYS = {
  CURRENT_STEP: 'mynews_current_step',
  PODCAST_TYPE: 'mynews_podcast_type',
  PODCAST_CONFIG: 'mynews_podcast_config',
  SCRIPT_CONTENT: 'mynews_script_content',
}

// 保存当前步骤到缓存
const saveCurrentStep = (step: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.CURRENT_STEP, step.toString());
  }
}

// 保存播客类型到缓存
const savePodcastType = (type: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.PODCAST_TYPE, type.toString());
  }
}

// 保存播客配置到缓存
const savePodcastConfig = (config: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.PODCAST_CONFIG, JSON.stringify(config));
  }
}

// 保存脚本内容到缓存
const saveScriptContent = (content: ScriptContent | null) => {
  if (typeof window !== 'undefined' && content) {
    localStorage.setItem(CACHE_KEYS.SCRIPT_CONTENT, JSON.stringify(content));
  }
}

export default function Dashboard() {
  // 状态管理
  const [step, setStep] = useState<number>(1)
  const [podcastType, setPodcastType] = useState<number>(2)  // 默认为资讯谈话类型
  const [webLink, setWebLink] = useState<string>('')
  const [customText, setCustomText] = useState<string>('')
  const [customTextError, setCustomTextError] = useState<string>('')
  const [generatedScript, setGeneratedScript] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [selectedVoice, setSelectedVoice] = useState<string>('专业男声')
  const [error, setError] = useState<string>('')
  const [podcastName, setPodcastName] = useState<string>('')
  const [episodeName, setEpisodeName] = useState<string>('')
  const [duration, setDuration] = useState<number>(5)
  const [hostCount, setHostCount] = useState<number>(1)
  const [host1Name, setHost1Name] = useState<string>('主播1')
  const [host2Name, setHost2Name] = useState<string>('主播2')
  const [voiceOptions, setVoiceOptions] = useState<{ name: string, voiceType: string }[]>([])
  const [host1Voice, setHost1Voice] = useState<string>('')
  const [host2Voice, setHost2Voice] = useState<string>('')

  // 添加播客列表状态
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([])
  const [showScript, setShowScript] = useState<PodcastItem | null>(null)

  // 在 Dashboard 组件内添加新的状态
  const [showVoiceModal1, setShowVoiceModal1] = useState(false)
  const [showVoiceModal2, setShowVoiceModal2] = useState(false)

  // 添加脚本编辑状态
  const [editableScript, setEditableScript] = useState<string>('')
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false)
  const [scriptContent, setScriptContent] = useState<ScriptContent | null>(null)
  const [scriptChunks, setScriptChunks] = useState<string[]>([])
  const [scriptProgress, setScriptProgress] = useState<number>(0)

  // 在组件顶部添加一个状态
  const [completeScriptJson, setCompleteScriptJson] = useState<string>('');

  // 在组件顶部添加一个状态，用于调试
  const [debugContent, setDebugContent] = useState<string>('');

  // 在组件顶部添加一个 ref 来存储内容片段
  const contentPartsRef = useRef<string[]>([]);

  // 在状态管理部分添加新的状态
  const [nftSupply, setNftSupply] = useState<number>(0)
  const [nftPrice, setNftPrice] = useState<number>(0)
  const [showNote, setShowNote] = useState<string>('')

  // 在组件顶部添加一个新的 ref 来存储音频元素
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 将音色选项按场景分组
  const groupedVoices = useMemo(() => {
    const groups: { [key: string]: { name: string, voiceType: string }[] } = {}
    voiceOptions.forEach(voice => {
      const [scene] = voice.name.split(' - ')
      if (!groups[scene]) {
        groups[scene] = []
      }
      groups[scene].push({
        name: voice.name.split(' - ')[1],
        voiceType: voice.voiceType
      })
    })
    return groups
  }, [voiceOptions])

  // 拉取音色列表
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/volcengine-voices`)
      .then(res => res.json())
      .then(data => {
        // 假设返回格式为 { success: true, data: [{scene, voices: [{name, voiceType}]}] }
        if (data && data.data) {
          // 扁平化所有音色
          const allVoices = data.data.flatMap((group: any) => group.voices.map((v: any) => ({
            name: `${group.scene} - ${v.name}`,
            voiceType: v.voice_type
          })))
          console.log(allVoices)
          setVoiceOptions(allVoices)
          // 默认选择第一个音色
          if (allVoices.length > 0) {
            setHost1Voice(allVoices[0].voiceType)
            setHost2Voice(allVoices[0].voiceType)
          }
        }
      })
      .catch(() => {})
  }, [])

  // 拉取播客列表
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/user-podcasts?uid=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          // 字段映射
          const mapped = data.data.map((item: any) => {
            // 合成 script 字符串
            let scriptText = '';
            if (item.script && item.script.contents) {
              scriptText = item.script.contents.map((c: any) => `${c.speakerName}: ${c.content}`).join('\n');
            }
            return {
              id: item.id, // 若无id用episode_name
              podcastName: item.podcast_name, // 后端没返回，留空或补充
              episodeName: item.episode_name,
              podcastType: 2, // 后端没返回，默认2
              status: item.status, // 后端没返回，默认1
              createdAt: item.created_at, // 直接使用接口返回的 created_at
              hosts: [], // 后端没返回，留空
              script: scriptText,
              audioUrl: item.audio_url,
              duration: 0, // 后端没返回
            }
          });
          setPodcasts(mapped);
        }
      })
      .catch(() => {})
  }, [])

  // 在组件加载时从缓存恢复状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 恢复当前步骤
      const cachedStep = localStorage.getItem(CACHE_KEYS.CURRENT_STEP);
      if (cachedStep) {
        setStep(parseInt(cachedStep, 10));
      }
      
      // 恢复播客类型
      const cachedType = localStorage.getItem(CACHE_KEYS.PODCAST_TYPE);
      if (cachedType) {
        setPodcastType(parseInt(cachedType, 10));
      }
      
      // 恢复播客配置
      const cachedConfig = localStorage.getItem(CACHE_KEYS.PODCAST_CONFIG);
      if (cachedConfig) {
        try {
          const config = JSON.parse(cachedConfig);
          setPodcastName(config.podcastName || '');
          setEpisodeName(config.episodeName || '');
          setDuration(config.duration || 5);
          setHostCount(config.hostCount || 1);
          setHost1Name(config.host1Name || '主播1');
          setHost2Name(config.host2Name || '主播2');
          setHost1Voice(config.host1Voice || '');
          setHost2Voice(config.host2Voice || '');
          setWebLink(config.webLink || '');
          setCustomText(config.customText || '');
        } catch (e) {
          console.error('恢复缓存配置失败:', e);
        }
      }
      
      // 恢复脚本内容
      const cachedScriptContent = localStorage.getItem(CACHE_KEYS.SCRIPT_CONTENT);
      if (cachedScriptContent && cachedStep === '3') {
        try {
          const content = JSON.parse(cachedScriptContent) as ScriptContent;
          setScriptContent(content);
          
          const editableText = content.contents
            .map((line: ScriptLine) => `${line.speakerName}: ${line.content}`)
            .join('\n\n');
          
          setEditableScript(editableText);
        } catch (e) {
          console.error('恢复脚本内容失败:', e);
        }
      }
    }
  }, []);

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
  }, [showScript?.audioUrl]);

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
    if (!showScript?.audioUrl) return;
    const url = showScript.audioUrl.startsWith('http') ? showScript.audioUrl : API_BASE_URL + showScript.audioUrl;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${showScript.podcastName || 'podcast'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 格式化时间
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 处理下一步
  const handleNextStep = () => {
    if (step === 1) {
      // 播客类型验证
      if (!podcastType) {
        setError('请选择播客类型')
        return
      }
      
      // 存储播客类型到缓存
      savePodcastType(podcastType);
      saveCurrentStep(2);
      
    } else if (step === 2) {
      // 信息源和基本信息验证
      const hasWebLink = webLink.trim() !== ''
      const hasCustomText = customText.trim() !== ''
      if (!hasWebLink && !hasCustomText) {
        setError('请先添加信息源')
        return
      }
      if (!podcastName.trim()) {
        setError('请输入播客名称')
        return
      }
      if (!episodeName.trim()) {
        setError('请输入节目名称')
        return
      }
      if (hostCount === 2) {
        if (!host1Name.trim()) {
          setError('请输入主播1姓名')
          return
        }
        if (!host2Name.trim()) {
          setError('请输入主播2姓名')
          return
        }
        if (!host1Voice) {
          setError('请选择主播1音色')
      return
        }
        if (!host2Voice) {
          setError('请选择主播2音色')
          return
        }
      } else {
        if (!host1Name.trim()) {
          setError('请输入主播姓名')
          return
        }
        if (!host1Voice) {
          setError('请选择主播音色')
          return
        }
      }
      
      // 保存配置到缓存
      savePodcastConfig({
        podcastName,
        episodeName,
        duration,
        hostCount,
        host1Name,
        host2Name,
        host1Voice,
        host2Voice,
        webLink,
        customText
      });
    }
    
    setError('')
    setStep(prev => prev + 1)
    saveCurrentStep(step + 1)
  }

  // 修改脚本生成函数
  const handleGenerateScript = async () => {
    // 校验信息源
    const hasWebLink = webLink.trim() !== ''
    const hasCustomText = customText.trim() !== ''
    if (!hasWebLink && !hasCustomText) {
      setError('请至少添加一个信息源')
      return
    }

    // 校验基本信息
    if (!podcastName.trim()) {
      setError('请输入播客名称')
      return
    }
    if (!episodeName.trim()) {
      setError('请输入节目名称')
      return
    }
    if (hostCount === 2) {
      if (!host1Name.trim()) {
        setError('请输入主播1姓名')
        return
      }
      if (!host2Name.trim()) {
        setError('请输入主播2姓名')
        return
      }
      if (!host1Voice) {
        setError('请选择主播1音色')
        return
      }
      if (!host2Voice) {
        setError('请选择主播2音色')
        return
      }
    } else {
      if (!host1Name.trim()) {
        setError('请输入主播姓名')
        return
      }
      if (!host1Voice) {
        setError('请选择主播音色')
        return
      }
    }
    
    setError('')
    setIsGeneratingScript(true)
    setScriptChunks([])
    setScriptProgress(0)
    setScriptContent(null)
    contentPartsRef.current = []
    
    // 保存配置到缓存（这个可以保留，因为是步骤2的配置）
    savePodcastConfig({
      podcastName,
      episodeName,
      duration,
      hostCount,
      host1Name,
      host2Name,
      host1Voice,
      host2Voice,
      webLink,
      customText
    });
    
    // 视觉上立即转到步骤3，但不保存到缓存
    setStep(3)
    
    try {
      // 准备hosts数据
      const hosts = hostCount === 2
        ? [
            { name: host1Name.trim() || '主播1', voice: host1Voice },
            { name: host2Name.trim() || '主播2', voice: host2Voice }
          ]
        : [
            { name: host1Name.trim() || '主播1', voice: host1Voice }
          ]

      // 创建请求配置
      const requestData = {
        url: webLink || undefined,
        textContent: customText || undefined,
        podcastName,
        episodeName,
        podcastType,
        hosts,
        duration,
        uid: '1'
      }

      // 发送POST请求并获取流式响应
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-script-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 获取可读流
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = '' // 用于存储不完整的SSE消息

      // 循环读取流数据
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // 解码二进制数据为文本
        const text = decoder.decode(value)
        buffer += text

        // 处理SSE格式的数据
        while (buffer.includes('\n\n')) {
          const messageEndIndex = buffer.indexOf('\n\n')
          const message = buffer.slice(0, messageEndIndex)
          buffer = buffer.slice(messageEndIndex + 2)

          // 解析SSE消息
          const eventMatch = message.match(/^event: (.+)$/m)
          const dataMatch = message.match(/^data: (.+)$/m)

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1]
            const data = dataMatch[1]

            // 处理不同事件类型
            switch (eventType) {
              case 'status':
                if (data === 'init') {
                  setScriptChunks(prev => [...prev, '开始处理内容源...\n'])
                  setScriptProgress(5)
                } else if (data === 'start') {
                  setScriptChunks(prev => [...prev, '内容源处理完成，开始生成脚本...\n'])
                  setScriptProgress(10)
                } else if (data === 'end') {
                  setScriptChunks(prev => [...prev, '\n脚本生成完成！'])
                  setScriptProgress(100)
                  setIsGeneratingScript(false)
                  // 不再在这里处理内容解析，而是等待 'complete' 事件
                }
                break;
              
              case 'error':
                setScriptChunks(prev => [...prev, `错误: ${data}\n`])
                setError(data)
                setIsGeneratingScript(false)
                break;
              
              case 'content':
                // 将内容显示在进度区域
                setScriptChunks(prev => {
                  const lastChunk = prev[prev.length - 1] || ''
                  const newChunks = [...prev]
                  if (lastChunk.startsWith('状态:') || 
                      lastChunk.startsWith('错误:') || 
                      lastChunk.endsWith('\n') || 
                      prev.length === 0) {
                    newChunks.push(data)
                  } else {
                    newChunks[newChunks.length - 1] = lastChunk + data
                  }
                  return newChunks
                });
                
                // 使用 ref 来收集内容片段
                contentPartsRef.current.push(data);
                
                // 用于调试
                console.log("收到content事件:", data);
                break;
              
              case 'complete':
                try {
                  console.log("收到complete事件:", data);
                  const scriptData = JSON.parse(data) as ScriptContent;
                  setScriptContent(scriptData);
                  
                  const editableText = scriptData.contents
                    .map((line: ScriptLine) => `${line.speakerName}: ${line.content}`)
                    .join('\n\n');
                  
                  setEditableScript(editableText);
                  
                  // 只有在成功接收到完整脚本后，才保存步骤3和脚本内容到缓存
                  saveCurrentStep(3);
                  saveScriptContent(scriptData);
                  
                  console.log("脚本生成成功，已收到完整内容");
                } catch (e) {
                  console.error("完整JSON解析失败:", e);
                  setError("脚本JSON解析失败");
                  // 如果解析失败，回到步骤2
                  setStep(2);
                  saveCurrentStep(2);
                }
                break;
              
              default:
                console.log(`未知事件类型: ${eventType}`, data)
            }
          }
        }
      }

    } catch (error) {
      console.error('脚本生成失败:', error)
      setError('脚本生成失败，请稍后重试')
      setIsGeneratingScript(false)
      // 发生错误时回到步骤2
      setStep(2);
      saveCurrentStep(2);
    }
  }

  // 添加生成音频函数
  const handleGenerateAudio = async () => {
    if (!scriptContent) {
      setError('请先生成脚本')
      return
    }
    
    // 验证每段对话内容不为空
    if (scriptContent.contents.some(line => !line.content.trim())) {
      setError('对话内容不能为空')
      return
    }
    
    // 验证每段对话内容不超过200字
    if (scriptContent.contents.some(line => line.content.length > 200)) {
      setError('每段对话内容不能超过200字')
      return
    }
    
    setIsGenerating(true)
    
    try {
      // 准备hosts数据
      const hosts = hostCount === 2
        ? [
            { name: host1Name.trim() || '主播1', voice: host1Voice },
            { name: host2Name.trim() || '主播2', voice: host2Voice }
          ]
        : [
            { name: host1Name.trim() || '主播1', voice: host1Voice }
          ]

      // 创建新的播客项时使用格式化的文本
      const formattedScript = scriptContent.contents
        .map(line => `${line.speakerName}: ${line.content}`)
        .join('\n\n');

      const newPodcast: PodcastItem = {
        id: Date.now().toString(),
        podcastName,
        episodeName,
        podcastType,
        status: PODCAST_STATUS.GENERATING,
        createdAt: new Date().toISOString(),
        hosts,
        duration,
        script: formattedScript,
        showNote,
        nftSupply,
        nftPrice: nftPrice.toString()
      }

      // 添加到列表顶部
      setPodcasts(prev => [newPodcast, ...prev])

      // 发送请求到后端
      const response = await fetch(`${API_BASE_URL}/api/v1/generate-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          podcastName,
          episodeName,
          hosts,
          script: JSON.stringify(scriptContent),
          showNote,
          nftSupply,
          nftPrice,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 重置表单并回到步骤1
      setWebLink('')
      setCustomText('')
      setPodcastName('')
      setEpisodeName('')
      setDuration(5)
      setHost1Name('主播1')
      setHost2Name('主播2')
      setStep(1)
      setScriptContent(null)
      setEditableScript('')
    } catch (error) {
      console.error('音频生成失败:', error)
      setError('音频生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <Header />
      
      <main className="flex-1 pt-18 sm:pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          
          {/* 设置表单卡片 */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-xl shadow-blue-900/20 mb-8 sm:mb-10">
            <div className="px-6 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 flex items-center">
                  <FiSettings className="mr-3 h-7 w-7 text-blue-400" />
                  创建新播客
                </h2>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-300">
                  步骤 {step}/3
                </div>
              </div>
            </div>
            
            <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
              <div className="max-w-3xl mx-auto">
                {step === 1 && (
                  <div className="space-y-8">
                    <div
                      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                        ${podcastType === 2 
                          ? 'bg-blue-900/30 border-2 border-blue-500/50' 
                          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/80'
                        }`}
                      onClick={() => {
                        setPodcastType(2)
                        setError('')
                      }}
                    >
                      {/* 添加发光效果 */}
                      {podcastType === 2 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                      )}
                      
                      <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                        <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center transition-all duration-300
                          ${podcastType === 2 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                            : 'bg-gray-700/50 text-gray-400'
                          }`}
                        >
                          <FiHeadphones className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">资讯&谈话</h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            将文章转换为专业的播客内容，支持多种信息源
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 即将推出的功能卡片 */}
                      {[
                        {
                          icon: <FiMusic />,
                          title: '音乐电台',
                          description: '即将推出'
                        },
                        {
                          icon: <FiBook />,
                          title: '语言学习',
                          description: '即将推出'
                        }
                      ].map((item, idx) => (
                        <div key={idx} className="relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/30 p-6 opacity-60 cursor-not-allowed">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-700/50 flex items-center justify-center text-gray-400">
                              {item.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-300">{item.title}</h3>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl">
                        <FiX className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-300 hover:translate-y-[-2px]"
                      onClick={handleNextStep}
                      disabled={!podcastType}
                    >
                      下一步
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    {/* 基本信息卡片 */}
                    <div className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiInfo className="mr-2" />
                        基本信息
                      </h3>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="播客名称"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          value={podcastName}
                          onChange={(e) => setPodcastName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="本期节目名称"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          value={episodeName}
                          onChange={(e) => setEpisodeName(e.target.value)}
                        />
                        <div>
                          <label className="block text-xs sm:text-sm text-blue-400 mb-1 sm:mb-2">
                            期望时长
                          </label>
                          <div className="flex gap-4">
                            {[
                              { label: '超短（1-10分钟）', value: 5 },
                              { label: '短（10-20分钟）', value: 15 },
                              { label: '长（20-30分钟）', value: 25 }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`
                                  flex-1 px-4 py-3 rounded-xl border-2 font-bold text-base transition-all
                                  ${duration === opt.value
                                    ? 'bg-blue-400 border-blue-400 text-white shadow'
                                    : 'bg-white border-blue-100 text-blue-500 hover:bg-blue-50'}
                                  focus:outline-none
                                `}
                                onClick={() => setDuration(opt.value)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 信息源 */}
                    <div className="bg-green-900/20 rounded-2xl border border-green-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-green-300 flex items-center mb-6">
                        <FiLink className="mr-2" />
                        信息源
                      </h3>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="输入网页链接"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                          value={webLink}
                          onChange={(e) => setWebLink(e.target.value)}
                        />
                        <div className="text-center text-xs sm:text-sm text-green-400 my-1 sm:my-2">或</div>
                        <textarea
                          placeholder="输入自定义文本内容"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all h-24 sm:h-32 resize-none"
                          value={customText}
                          onChange={e => {
                            const val = e.target.value
                            if (val.length > 10000) {
                              setCustomTextError('自定义文本不能超过 10000 字')
                            } else {
                              setCustomTextError('')
                              setCustomText(val)
                            }
                          }}
                          maxLength={10000}
                        />
                        <div className="flex justify-between text-xs text-green-400">
                          <span>已输入 {customText.length} / 10000 字</span>
                          {customTextError && <span className="text-red-400">{customTextError}</span>}
                        </div>
                      </div>
                    </div>

                    {/* 主播设置 */}
                    <div className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiHeadphones className="mr-2" />
                        主播设置
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <label className="text-base font-medium text-blue-700">主播人数：</label>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border-2 font-bold text-base transition-all
                              ${hostCount === 1 ? 'bg-blue-400 text-white border-blue-400' : 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => setHostCount(1)}
                          >
                            1人
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border-2 font-bold text-base transition-all
                              ${hostCount === 2 ? 'bg-blue-400 text-white border-blue-400' : 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => setHostCount(2)}
                          >
                            2人
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-sm text-blue-400 mb-1">主播1姓名</label>
                            <input
                              type="text"
                              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              value={host1Name}
                              onChange={e => setHost1Name(e.target.value)}
                              placeholder="请输入主播1姓名"
                            />
                            <button
                              type="button"
                              onClick={() => setShowVoiceModal1(true)}
                              className="mt-2 w-full rounded-lg border-2 px-4 py-3 text-left text-base border-blue-100 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 flex justify-between items-center"
                            >
                              <span>{voiceOptions.find(v => v.voiceType === host1Voice)?.name || '选择音色'}</span>
                              <FiChevronDown className="h-5 w-5 text-blue-400" />
                            </button>
                          </div>
                          {hostCount === 2 && (
                            <div className="flex-1">
                              <label className="block text-sm text-blue-400 mb-1">主播2姓名</label>
                              <input
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={host2Name}
                                onChange={e => setHost2Name(e.target.value)}
                                placeholder="请输入主播2姓名"
                              />
                              <button
                                type="button"
                                onClick={() => setShowVoiceModal2(true)}
                                className="mt-2 w-full rounded-lg border-2 px-4 py-3 text-left text-base border-blue-100 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 flex justify-between items-center"
                              >
                                <span>{voiceOptions.find(v => v.voiceType === host2Voice)?.name || '选择音色'}</span>
                                <FiChevronDown className="h-5 w-5 text-blue-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 添加 NFT 配置部分 */}
                    <div className="bg-purple-900/20 rounded-2xl border border-purple-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-purple-300 flex items-center mb-6">
                        <FiCpu className="mr-2" />
                        NFT 配置
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-purple-400 mb-1">供应量</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="设置 NFT 供应量"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            value={nftSupply||1}
                            onChange={e => setNftSupply(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-400 mb-1">价格 (SOL)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.00001"
                            placeholder="设置 NFT 价格"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            value={nftPrice || 0.0001}
                            onChange={e => {
                              const value = e.target.value;
                              // 如果输入为空，设置为0
                              if (value === '') {
                                setNftPrice(0);
                                return;
                              }
                              // 验证是否为有效数字
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                // 使用 toFixed 来避免科学计数法
                                const fixedNum = parseFloat(num.toFixed(9));
                                setNftPrice(fixedNum);
                              }
                            }}
                            onBlur={e => {
                              // 在失去焦点时格式化显示
                              const num = parseFloat(e.target.value);
                              if (!isNaN(num) && num >= 0) {
                                const fixedNum = parseFloat(num.toFixed(9));
                                setNftPrice(fixedNum);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl">
                        <FiX className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-5 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-lg sm:rounded-xl border-blue-200 text-blue-400 font-bold text-base sm:text-lg py-3 sm:py-4"
                        onClick={() => setStep(1)}
                      >
                        <FiChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        上一步
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 rounded-lg sm:rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-lg sm:text-2xl py-3 sm:py-4 shadow-none"
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript}
                      >
                        {isGeneratingScript ? '生成中...' : '生成脚本'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6 sm:space-y-10">
                    <section className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiFileText className="mr-2 sm:mr-3" /> 
                        脚本预览与编辑
                      </h3>
                      {isGeneratingScript ? (
                        <div className="space-y-6">
                          {/* 美化对话内容展示 */}
                          <div className="relative">
                            <div className="max-h-[500px] overflow-y-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 text-gray-300 font-mono border border-gray-700/50 shadow-inner">
                              {scriptChunks.map((chunk, index) => {
                                // 判断是否是状态消息
                                if (chunk.startsWith('开始') || chunk.startsWith('内容源') || chunk.includes('完成')) {
                                  return (
                                    <div key={index} className="flex items-center justify-center py-2 text-blue-400 text-sm">
                                      <div className="px-4 py-1 bg-blue-900/30 border border-blue-700/50 rounded-full">
                                        {chunk}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // 普通内容展示为对话气泡
                                return (
                                  <div key={index} className="py-2 transition-all duration-300 ease-out animate-fadeIn">
                                    {chunk}
                                  </div>
                                );
                              })}
                              {/* 打字机动画指示器 */}
                              <div className="typing-indicator inline-flex gap-1.5 mt-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing1"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing2"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing3"></span>
                              </div>
                            </div>
                            {/* 渐变遮罩 */}
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {scriptContent?.contents.map((line, index) => (
                              <div key={index} className="flex flex-col gap-2">
                                {/* 主播名称深色背景 */}
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
                                {/* 对话内容输入框深色风格 */}
                                <div className="relative">
                                  <textarea
                                    value={line.content}
                                    onChange={e => {
                                      if (e.target.value.length > 200) return;
                                      const newContents = [...scriptContent.contents];
                                      newContents[index] = {
                                        ...newContents[index],
                                        content: e.target.value
                                      };
                                      setScriptContent({ contents: newContents });
                                      saveScriptContent({ contents: newContents });
                                    }}
                                    className="w-full px-4 py-2 border border-blue-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-blue-100 bg-gray-900/60 font-mono text-sm resize-none hover:border-blue-500/40 transition-all"
                                    rows={2}
                                    placeholder="编辑对话内容..."
                                    maxLength={200}
                                  />
                                  <div className="absolute top-2 right-2 text-blue-700/40">
                                    <FiEdit2 className="w-4 h-4" />
                                  </div>
                                  <div className="absolute bottom-2 right-2 text-xs text-blue-700/40">
                                    {line.content.length}/200
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-blue-400 mt-2">
                            * 您可以直接编辑对话内容。主播名称已固定，不可更改。
                          </div>
                        </>
                      )}
                    </section>

                    {/* ShowNote 输入框部分也相应调整样式 */}
                    {!isGeneratingScript && scriptContent && (
                      <section className="bg-green-900/20 rounded-2xl border border-green-700/50 p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-green-300 flex items-center mb-6">
                          <FiFileText className="mr-2 sm:mr-3" /> 
                          播客ShowNote
                        </h3>
                        <textarea
                          placeholder="请输入播客shownote..."
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all h-32 resize-none"
                          value={showNote}
                          onChange={e => setShowNote(e.target.value)}
                        />
                        <p className="text-xs text-green-400 mt-2">
                          添加ShowNote可以帮助听众更好地了解节目内容
                        </p>
                      </section>
                    )}

                    {/* 错误提示也保持一致的样式 */}
                    {error && (
                      <div className="flex items-center gap-2 text-red-300 bg-red-900/30 px-4 py-3 rounded-xl border border-red-700/50">
                        <FiX className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* 按钮样式保持不变 */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-5 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-lg sm:rounded-xl border-blue-200 text-blue-400 font-bold text-base sm:text-lg py-3 sm:py-4"
                        onClick={() => setStep(2)}
                        disabled={isGeneratingScript}
                      >
                        <FiChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        上一步
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 rounded-lg sm:rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-lg sm:text-2xl py-3 sm:py-4 shadow-none"
                        onClick={handleGenerateAudio}
                        disabled={isGenerating || isGeneratingScript || !scriptContent}
                      >
                        {isGenerating ? '生成中...' : '生成播客音频'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 播客列表卡片 */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-xl shadow-blue-900/20">
            <div className="px-6 sm:px-8 lg:px-12 py-6 sm:py-8 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiHeadphones className="mr-3 h-6 w-6 text-blue-400" />
                我的播客
              </h2>
            </div>

            <div className="divide-y divide-gray-700/50">
              {podcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FiHeadphones className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">暂无播客</p>
                  <p className="text-gray-500 text-sm mt-2">开始创建你的第一个播客吧！</p>
                </div>
              ) : (
                podcasts.map((podcast, idx) => (
                  <div
                    key={`${podcast.id}_${idx}`}
                    className="px-6 sm:px-8 lg:px-12 py-6 hover:bg-gray-800/30 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {podcast.podcastName}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/50">
                          {podcast.episodeName}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 gap-4">
                        <span className="flex items-center">
                          <FiClock className="mr-1 h-4 w-4" />
                          {new Date(podcast.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isPodcastGenerating(podcast.status) ? (
                        <span className="flex items-center text-base text-blue-300 font-medium bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-700/50">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-400 rounded-full animate-spin mr-2"></div>
                          生成中
                        </span>
                      ) : isPodcastCompleted(podcast.status) ? (
                        <button
                          onClick={() => setShowScript(podcast)}
                          className="group px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 text-blue-300 hover:text-blue-200 transition-all duration-300 flex items-center gap-2"
                        >
                          <FiFileText className="h-4 w-4" />
                          播客脚本 & 音频
                        </button>
                      ) : (
                        <span className="flex items-center text-base text-red-300 font-medium bg-red-900/30 px-4 py-2 rounded-xl border border-red-700/50">
                          <FiX className="mr-1 h-4 w-4" />
                          生成失败
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {showScript && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 rounded-2xl shadow-2xl p-0 max-w-lg w-full relative flex flex-col border border-gray-700/70">
            {/* 关闭按钮 */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full
                bg-gradient-to-br from-blue-700 via-purple-700 to-blue-900 text-white
                shadow-lg border-2 border-blue-400/40
                hover:from-blue-500 hover:to-purple-500 hover:border-blue-300
                hover:scale-110 hover:shadow-xl
                transition-all duration-200"
              onClick={() => setShowScript(null)}
              aria-label="关闭"
            >
              <FiX className="w-7 h-7" />
            </button>
            <h3 className="text-xl font-bold pt-6 pb-2 px-8 text-blue-200 text-center mb-2">播客脚本 & 音频</h3>
            {/* 音频播放器 */}
            <div className="w-full flex flex-col items-center justify-center px-8 mb-2">
              {showScript.audioUrl ? (
                <audio
                  ref={audioRef}
                  controls
                  src={showScript.audioUrl.startsWith('http') ? showScript.audioUrl : API_BASE_URL + showScript.audioUrl}
                  className="w-full dark-audio"
                  style={{
                    background: '#181e2a',
                    borderRadius: '12px',
                    colorScheme: 'dark',
                    marginBottom: '0.5rem'
                  }}
                />
              ) : (
                <div className="text-blue-300 mb-4">暂无音频</div>
              )}
            </div>
            {/* 脚本气泡 */}
            <div className="overflow-y-auto max-h-[50vh] px-8 pb-8">
              {showScript.script
                ? (() => {
                    // 动态分配speaker颜色
                    const speakerOrder: string[] = [];
                    return showScript.script
                      .split('\n')
                      .filter(line => line.trim())
                      .map((line, idx) => {
                        const [speakerRaw, ...contentArr] = line.split(':');
                        const speaker = speakerRaw.trim();
                        const content = contentArr.join(':').trim();
                        // 记录出现顺序
                        if (speaker && !speakerOrder.includes(speaker)) {
                          speakerOrder.push(speaker);
                        }
                        // 只用前两个speaker
                        const isHost1 = speaker === speakerOrder[0];
                        const bubbleColor = isHost1
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800';
                        const align = isHost1 ? 'justify-start' : 'justify-end';
                        const nameColor = isHost1 ? 'text-blue-500' : 'text-green-500';
                        return (
                          <div key={idx} className={`flex ${align} mb-3`}>
                            <div className={`rounded-xl px-4 py-2 ${bubbleColor} max-w-[80%]`}>
                              <span className={`font-semibold mr-2 ${nameColor}`}>{speaker}：</span>
                              <span className="break-words">{content}</span>
                            </div>
                          </div>
                        );
                      });
                  })()
                : <div className="text-blue-300">暂无脚本</div>
              }
            </div>
          </div>
        </div>
      )}

      {/* 添加音色选择模态框 */}
      {(showVoiceModal1 || showVoiceModal2) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative p-0">
            {/* 固定顶部控制栏 */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-6 pt-6 pb-2 border-b border-blue-100">
              <h3 className="text-xl font-bold text-blue-700">
                选择音色 - {showVoiceModal1 ? '主播1' : '主播2'}
              </h3>
              <button
                onClick={() => {
                  setShowVoiceModal1(false)
                  setShowVoiceModal2(false)
                }}
                className="text-blue-400 hover:text-blue-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            {/* 音色列表内容 ... */}
            <div className="space-y-4 px-6 pb-6 pt-2">
              {Object.entries(groupedVoices).map(([scene, voices]) => (
                <div key={scene} className="border-b border-blue-100 pb-4">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">{scene}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {voices.map(voice => (
                      <button
                        key={voice.voiceType}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                          (showVoiceModal1 ? host1Voice : host2Voice) === voice.voiceType
                            ? 'bg-blue-400 text-white'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                        onClick={() => {
                          if (showVoiceModal1) {
                            setHost1Voice(voice.voiceType)
                            setShowVoiceModal1(false)
                          } else {
                            setHost2Voice(voice.voiceType)
                            setShowVoiceModal2(false)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{voice.name}</span>
                          {(showVoiceModal1 ? host1Voice : host2Voice) === voice.voiceType && (
                            <FiCheck className="h-5 w-5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 