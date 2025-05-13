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

// Add API base URL constant
const API_BASE_URL = 'http://127.0.0.1:8090'

// First define status constants
const PODCAST_STATUS = {
  GENERATING: 0,
  COMPLETED: 1,
  FAILED: 2
} as const;

// Then use numbers when determining status
const isPodcastGenerating = (status: number) => status === PODCAST_STATUS.GENERATING;
const isPodcastCompleted = (status: number) => status === PODCAST_STATUS.COMPLETED;

// Define podcast item types
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

// Add appropriate interface definitions
interface ScriptLine {
  speakerName: string;
  content: string;
}

interface ScriptContent {
  contents: ScriptLine[];
}

// Cache-related constants and utility functions
const CACHE_KEYS = {
  CURRENT_STEP: 'mynews_current_step',
  PODCAST_TYPE: 'mynews_podcast_type',
  PODCAST_CONFIG: 'mynews_podcast_config',
  SCRIPT_CONTENT: 'mynews_script_content',
}

// Save current step to cache
const saveCurrentStep = (step: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.CURRENT_STEP, step.toString());
  }
}

// Save podcast type to cache
const savePodcastType = (type: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.PODCAST_TYPE, type.toString());
  }
}

// Save podcast configuration to cache
const savePodcastConfig = (config: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CACHE_KEYS.PODCAST_CONFIG, JSON.stringify(config));
  }
}

// Save script content to cache
const saveScriptContent = (content: ScriptContent | null) => {
  if (typeof window !== 'undefined' && content) {
    localStorage.setItem(CACHE_KEYS.SCRIPT_CONTENT, JSON.stringify(content));
  }
}

export default function Dashboard() {
  // State management
  const [step, setStep] = useState<number>(1)
  const [podcastType, setPodcastType] = useState<number>(2)  // Default to news/talk type
  const [webLink, setWebLink] = useState<string>('')
  const [customText, setCustomText] = useState<string>('')
  const [customTextError, setCustomTextError] = useState<string>('')
  const [generatedScript, setGeneratedScript] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [selectedVoice, setSelectedVoice] = useState<string>('Professional Male Voice')
  const [error, setError] = useState<string>('')
  const [podcastName, setPodcastName] = useState<string>('')
  const [episodeName, setEpisodeName] = useState<string>('')
  const [duration, setDuration] = useState<number>(5)
  const [hostCount, setHostCount] = useState<number>(1)
  const [host1Name, setHost1Name] = useState<string>('Host 1')
  const [host2Name, setHost2Name] = useState<string>('Host 2')
  const [voiceOptions, setVoiceOptions] = useState<{ name: string, voiceType: string }[]>([])
  const [host1Voice, setHost1Voice] = useState<string>('')
  const [host2Voice, setHost2Voice] = useState<string>('')

  // Add podcast list state
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([])
  const [showScript, setShowScript] = useState<PodcastItem | null>(null)

  // Add new states in Dashboard component
  const [showVoiceModal1, setShowVoiceModal1] = useState(false)
  const [showVoiceModal2, setShowVoiceModal2] = useState(false)

  // Add script editing states
  const [editableScript, setEditableScript] = useState<string>('')
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false)
  const [scriptContent, setScriptContent] = useState<ScriptContent | null>(null)
  const [scriptChunks, setScriptChunks] = useState<string[]>([])
  const [scriptProgress, setScriptProgress] = useState<number>(0)

  // Add a state at the top of the component
  const [completeScriptJson, setCompleteScriptJson] = useState<string>('');

  // Add a state at the top of the component for debugging
  const [debugContent, setDebugContent] = useState<string>('');

  // Add a ref at the top of the component to store content fragments
  const contentPartsRef = useRef<string[]>([]);

  // Add new states in the state management section
  const [nftSupply, setNftSupply] = useState<number>(0)
  const [nftPrice, setNftPrice] = useState<number>(0)
  const [showNote, setShowNote] = useState<string>('')

  // Add a new ref at the top of the component to store the audio element
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Group voice options by scene
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

  // Fetch voice list
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/volcengine-voices`)
      .then(res => res.json())
      .then(data => {
        // Assuming the return format is { success: true, data: [{scene, voices: [{name, voiceType}]}] }
        if (data && data.data) {
          // Flatten all voices
          const allVoices = data.data.flatMap((group: any) => group.voices.map((v: any) => ({
            name: `${group.scene} - ${v.name}`,
            voiceType: v.voice_type
          })))
          console.log(allVoices)
          setVoiceOptions(allVoices)
          // Select the first voice by default
          if (allVoices.length > 0) {
            setHost1Voice(allVoices[0].voiceType)
            setHost2Voice(allVoices[0].voiceType)
          }
        }
      })
      .catch(() => {})
  }, [])

  // Fetch podcast list
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/user-podcasts?uid=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          // Field mapping
          const mapped = data.data.map((item: any) => {
            // Combine script string
            let scriptText = '';
            if (item.script && item.script.contents) {
              scriptText = item.script.contents.map((c: any) => `${c.speakerName}: ${c.content}`).join('\n');
            }
            return {
              id: item.id, // If no id, use episode_name
              podcastName: item.podcast_name, // If not returned from backend, leave empty or supplement
              episodeName: item.episode_name,
              podcastType: 2, // Default to 2 if not returned from backend
              status: item.status, // Default to 1 if not returned from backend
              createdAt: item.created_at, // Use created_at directly from API response
              hosts: [], // Leave empty if not returned from backend
              script: scriptText,
              audioUrl: item.audio_url,
              duration: 0, // Not returned from backend
            }
          });
          setPodcasts(mapped);
        }
      })
      .catch(() => {})
  }, [])

  // Restore state from cache when component loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Restore current step
      const cachedStep = localStorage.getItem(CACHE_KEYS.CURRENT_STEP);
      if (cachedStep) {
        setStep(parseInt(cachedStep, 10));
      }
      
      // Restore podcast type
      const cachedType = localStorage.getItem(CACHE_KEYS.PODCAST_TYPE);
      if (cachedType) {
        setPodcastType(parseInt(cachedType, 10));
      }
      
      // Restore podcast configuration
      const cachedConfig = localStorage.getItem(CACHE_KEYS.PODCAST_CONFIG);
      if (cachedConfig) {
        try {
          const config = JSON.parse(cachedConfig);
          setPodcastName(config.podcastName || '');
          setEpisodeName(config.episodeName || '');
          setDuration(config.duration || 5);
          setHostCount(config.hostCount || 1);
          setHost1Name(config.host1Name || 'Host 1');
          setHost2Name(config.host2Name || 'Host 2');
          setHost1Voice(config.host1Voice || '');
          setHost2Voice(config.host2Voice || '');
          setWebLink(config.webLink || '');
          setCustomText(config.customText || '');
        } catch (e) {
          console.error('Failed to restore cached configuration:', e);
        }
      }
      
      // Restore script content
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
          console.error('Failed to restore script content:', e);
        }
      }
    }
  }, []);

  // Listen for audio progress
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

  // Drag progress bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setAudioProgress(value);
  };

  // Play/pause
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

  // Reset play state when audio ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  // Volume change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Volume slider handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (value === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  // Toggle mute
  const handleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Download audio
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

  // Format time
  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Podcast type validation
      if (!podcastType) {
        setError('Please select a podcast type')
        return
      }
      
      // Store podcast type in cache
      savePodcastType(podcastType);
      saveCurrentStep(2);
      
    } else if (step === 2) {
      // Information source and basic info validation
      const hasWebLink = webLink.trim() !== ''
      const hasCustomText = customText.trim() !== ''
      if (!hasWebLink && !hasCustomText) {
        setError('Please add an information source')
        return
      }
      if (!podcastName.trim()) {
        setError('Please enter a podcast name')
        return
      }
      if (!episodeName.trim()) {
        setError('Please enter an episode name')
        return
      }
      if (hostCount === 2) {
        if (!host1Name.trim()) {
          setError('Please enter Host 1 name')
          return
        }
        if (!host2Name.trim()) {
          setError('Please enter Host 2 name')
          return
        }
        if (!host1Voice) {
          setError('Please select Host 1 voice')
          return
        }
        if (!host2Voice) {
          setError('Please select Host 2 voice')
          return
        }
      } else {
        if (!host1Name.trim()) {
          setError('Please enter host name')
          return
        }
        if (!host1Voice) {
          setError('Please select host voice')
          return
        }
      }
      
      // Save configuration to cache
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

  // Modify script generation function
  const handleGenerateScript = async () => {
    // Validate information source
    const hasWebLink = webLink.trim() !== ''
    const hasCustomText = customText.trim() !== ''
    if (!hasWebLink && !hasCustomText) {
      setError('Please add at least one information source')
      return
    }

    // Validate basic information
    if (!podcastName.trim()) {
      setError('Please enter a podcast name')
      return
    }
    if (!episodeName.trim()) {
      setError('Please enter an episode name')
      return
    }
    if (hostCount === 2) {
      if (!host1Name.trim()) {
        setError('Please enter Host 1 name')
        return
      }
      if (!host2Name.trim()) {
        setError('Please enter Host 2 name')
        return
      }
      if (!host1Voice) {
        setError('Please select Host 1 voice')
        return
      }
      if (!host2Voice) {
        setError('Please select Host 2 voice')
        return
      }
    } else {
      if (!host1Name.trim()) {
        setError('Please enter host name')
        return
      }
      if (!host1Voice) {
        setError('Please select host voice')
        return
      }
    }
    
    setError('')
    setIsGeneratingScript(true)
    setScriptChunks([])
    setScriptProgress(0)
    setScriptContent(null)
    contentPartsRef.current = []
    
    // Save configuration to cache (can be kept as it's step 2 configuration)
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
    
    // Visually move to step 3 immediately, but don't save to cache
    setStep(3)
    
    try {
      // Prepare hosts data
      const hosts = hostCount === 2
        ? [
            { name: host1Name.trim() || 'Host 1', voice: host1Voice },
            { name: host2Name.trim() || 'Host 2', voice: host2Voice }
          ]
        : [
            { name: host1Name.trim() || 'Host 1', voice: host1Voice }
          ]

      // Create request configuration
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

      // Send POST request and get streaming response
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

      // Get readable stream
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = '' // Used to store incomplete SSE messages

      // Loop to read stream data
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // Decode binary data to text
        const text = decoder.decode(value)
        buffer += text

        // Process SSE format data
        while (buffer.includes('\n\n')) {
          const messageEndIndex = buffer.indexOf('\n\n')
          const message = buffer.slice(0, messageEndIndex)
          buffer = buffer.slice(messageEndIndex + 2)

          // Parse SSE message
          const eventMatch = message.match(/^event: (.+)$/m)
          const dataMatch = message.match(/^data: (.+)$/m)

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1]
            const data = dataMatch[1]

            // Handle different event types
            switch (eventType) {
              case 'status':
                if (data === 'init') {
                  setScriptChunks(prev => [...prev, 'Starting to process content source...\n'])
                  setScriptProgress(5)
                } else if (data === 'start') {
                  setScriptChunks(prev => [...prev, 'Content source processed, generating script...\n'])
                  setScriptProgress(10)
                } else if (data === 'end') {
                  setScriptChunks(prev => [...prev, '\nScript generation complete!'])
                  setScriptProgress(100)
                  setIsGeneratingScript(false)
                  // No longer process content parsing here, wait for 'complete' event
                }
                break;
              
              case 'error':
                setScriptChunks(prev => [...prev, `Error: ${data}\n`])
                setError(data)
                setIsGeneratingScript(false)
                break;
              
              case 'content':
                // Display content in progress area
                setScriptChunks(prev => {
                  const lastChunk = prev[prev.length - 1] || ''
                  const newChunks = [...prev]
                  if (lastChunk.startsWith('Status:') || 
                      lastChunk.startsWith('Error:') || 
                      lastChunk.endsWith('\n') || 
                      prev.length === 0) {
                    newChunks.push(data)
                  } else {
                    newChunks[newChunks.length - 1] = lastChunk + data
                  }
                  return newChunks
                });
                
                // Use ref to collect content fragments
                contentPartsRef.current.push(data);
                
                break;
              
              case 'complete':
                try {
                  console.log("Received complete event:", data);
                  const scriptData = JSON.parse(data) as ScriptContent;
                  setScriptContent(scriptData);
                  
                  const editableText = scriptData.contents
                    .map((line: ScriptLine) => `${line.speakerName}: ${line.content}`)
                    .join('\n\n');
                  
                  setEditableScript(editableText);
                  
                  // Only save step 3 and script content to cache after successful receipt of complete script
                  saveCurrentStep(3);
                  saveScriptContent(scriptData);
                  
                  console.log("Script generation successful, complete content received");
                } catch (e) {
                  console.error("Complete JSON parsing failed:", e);
                  setError("Script JSON parsing failed");
                  // Return to step 2 if parsing fails
                  setStep(2);
                  saveCurrentStep(2);
                }
                break;
              
              default:
                console.log(`Unknown event type: ${eventType}`, data)
            }
          }
        }
      }

    } catch (error) {
      console.error('Script generation failed:', error)
      setError('Script generation failed, please try again later')
      setIsGeneratingScript(false)
      // Return to step 2 if error occurs
      setStep(2);
      saveCurrentStep(2);
    }
  }

  // Add audio generation function
  const handleGenerateAudio = async () => {
    if (!scriptContent) {
      setError('Please generate a script first')
      return
    }
    
    // Validate that no dialog content is empty
    if (scriptContent.contents.some(line => !line.content.trim())) {
      setError('Dialog content cannot be empty')
      return
    }
    
    // Validate that no dialog content exceeds 200 characters
    if (scriptContent.contents.some(line => line.content.length > 200)) {
      setError('Each dialog content cannot exceed 200 characters')
      return
    }
    
    setIsGenerating(true)
    
    try {
      // Prepare hosts data
      const hosts = hostCount === 2
        ? [
            { name: host1Name.trim() || 'Host 1', voice: host1Voice },
            { name: host2Name.trim() || 'Host 2', voice: host2Voice }
          ]
        : [
            { name: host1Name.trim() || 'Host 1', voice: host1Voice }
          ]

      // Use formatted text when creating new podcast item
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

      // Add to top of list
      setPodcasts(prev => [newPodcast, ...prev])

      // Send request to backend
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

      // Reset form and return to step 1
      setWebLink('')
      setCustomText('')
      setPodcastName('')
      setEpisodeName('')
      setDuration(5)
      setHost1Name('Host 1')
      setHost2Name('Host 2')
      setStep(1)
      setScriptContent(null)
      setEditableScript('')
    } catch (error) {
      console.error('Audio generation failed:', error)
      setError('Audio generation failed, please try again later')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <Header />
      
      <main className="flex-1 pt-18 sm:pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          
          {/* Settings form card */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-xl shadow-blue-900/20 mb-8 sm:mb-10">
            <div className="px-6 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 flex items-center">
                  <FiSettings className="mr-3 h-7 w-7 text-blue-400" />
                  Create New Podcast
                </h2>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-300">
                  Step {step}/3
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
                      {/* Add glow effect */}
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
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">News & Talk</h3>
                          <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            Convert articles to professional podcast content, supporting multiple information sources
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Coming soon feature cards */}
                      {[
                        {
                          icon: <FiMusic />,
                          title: 'Music Radio',
                          description: 'Coming soon'
                        },
                        {
                          icon: <FiBook />,
                          title: 'Language Learning',
                          description: 'Coming soon'
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
                      Next
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    {/* Basic information card */}
                    <div className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiInfo className="mr-2" />
                        Basic Information
                      </h3>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Podcast Name"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          value={podcastName}
                          onChange={(e) => setPodcastName(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Episode Name"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          value={episodeName}
                          onChange={(e) => setEpisodeName(e.target.value)}
                        />
                        <div>
                          <label className="block text-xs sm:text-sm text-blue-400 mb-1 sm:mb-2">
                            Desired Length
                          </label>
                          <div className="flex gap-4">
                            {[
                              { label: 'Short (1-10 min)', value: 5 },
                              { label: 'Medium (10-20 min)', value: 15 },
                              { label: 'Long (20-30 min)', value: 25 }
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

                    {/* Information Source */}
                    <div className="bg-green-900/20 rounded-2xl border border-green-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-green-300 flex items-center mb-6">
                        <FiLink className="mr-2" />
                        Information Source
                      </h3>
                      
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Enter Web Link"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                          value={webLink}
                          onChange={(e) => setWebLink(e.target.value)}
                        />
                        {/* Added anti-crawler platform reminder */}
                        <div className="text-xs text-yellow-400 mt-1">
                          If the platform (e.g., x.com) has anti-crawler mechanisms, content may not be automatically retrieved. Please manually paste text into the input box below.<br />
                        </div>
                        <div className="text-center text-xs sm:text-sm text-green-400 my-1 sm:my-2">or</div>
                        <textarea
                          placeholder="Enter Custom Text Content"
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all h-24 sm:h-32 resize-none"
                          value={customText}
                          onChange={e => {
                            const val = e.target.value
                            if (val.length > 10000) {
                              setCustomTextError('Custom text cannot exceed 10,000 characters')
                            } else {
                              setCustomTextError('')
                              setCustomText(val)
                            }
                          }}
                          maxLength={10000}
                        />
                        <div className="flex justify-between text-xs text-green-400">
                          <span>Entered {customText.length} / 10000 characters</span>
                          {customTextError && <span className="text-red-400">{customTextError}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Host Settings */}
                    <div className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiHeadphones className="mr-2" />
                        Host Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          <label className="text-base font-medium text-blue-700">Number of Hosts:</label>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border-2 font-bold text-base transition-all
                              ${hostCount === 1 ? 'bg-blue-400 text-white border-blue-400' : 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => setHostCount(1)}
                          >
                            1 Host
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded-lg border-2 font-bold text-base transition-all
                              ${hostCount === 2 ? 'bg-blue-400 text-white border-blue-400' : 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => setHostCount(2)}
                          >
                            2 Hosts
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="block text-sm text-blue-400 mb-1">Host 1 Name</label>
                            <input
                              type="text"
                              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              value={host1Name}
                              onChange={e => setHost1Name(e.target.value)}
                              placeholder="Enter Host 1 Name"
                            />
                            <button
                              type="button"
                              onClick={() => setShowVoiceModal1(true)}
                              className="mt-2 w-full rounded-lg border-2 px-4 py-3 text-left text-base border-blue-100 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 flex justify-between items-center"
                            >
                              <span>{voiceOptions.find(v => v.voiceType === host1Voice)?.name || 'Select Voice'}</span>
                              <FiChevronDown className="h-5 w-5 text-blue-400" />
                            </button>
                          </div>
                          {hostCount === 2 && (
                            <div className="flex-1">
                              <label className="block text-sm text-blue-400 mb-1">Host 2 Name</label>
                              <input
                                type="text"
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                value={host2Name}
                                onChange={e => setHost2Name(e.target.value)}
                                placeholder="Enter Host 2 Name"
                              />
                              <button
                                type="button"
                                onClick={() => setShowVoiceModal2(true)}
                                className="mt-2 w-full rounded-lg border-2 px-4 py-3 text-left text-base border-blue-100 text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 flex justify-between items-center"
                              >
                                <span>{voiceOptions.find(v => v.voiceType === host2Voice)?.name || 'Select Voice'}</span>
                                <FiChevronDown className="h-5 w-5 text-blue-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add NFT configuration section */}
                    <div className="bg-purple-900/20 rounded-2xl border border-purple-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-purple-300 flex items-center mb-6">
                        <FiCpu className="mr-2" />
                        NFT Configuration
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-purple-400 mb-1">Supply</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Set NFT Supply"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            value={nftSupply||1}
                            onChange={e => setNftSupply(parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-purple-400 mb-1">Price (SOL)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.00001"
                            placeholder="Set NFT Price"
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            value={nftPrice || 0.0001}
                            onChange={e => {
                              const value = e.target.value;
                              // If input is empty, set to 0
                              if (value === '') {
                                setNftPrice(0);
                                return;
                              }
                              // Verify if it's a valid number
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                // Use toFixed to avoid scientific notation
                                const fixedNum = parseFloat(num.toFixed(9));
                                setNftPrice(fixedNum);
                              }
                            }}
                            onBlur={e => {
                              // Format display when focus is lost
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
                        Previous
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 rounded-lg sm:rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-lg sm:text-2xl py-3 sm:py-4 shadow-none"
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript}
                      >
                        {isGeneratingScript ? 'Generating...' : 'Generate Script'}
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6 sm:space-y-10">
                    <section className="bg-blue-900/20 rounded-2xl border border-blue-700/50 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-blue-300 flex items-center mb-6">
                        <FiFileText className="mr-2 sm:mr-3" /> 
                        Script Preview & Edit
                      </h3>
                      {isGeneratingScript ? (
                        <div className="space-y-6">
                          {/* Beautify dialogue content display */}
                          <div className="relative">
                            <div className="max-h-[500px] overflow-y-auto bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 text-gray-300 font-mono border border-gray-700/50 shadow-inner">
                              {scriptChunks.map((chunk, index) => {
                                // Determine if it's a status message
                                if (chunk.startsWith('Starting') || chunk.startsWith('Content source') || chunk.includes('complete')) {
                                  return (
                                    <div key={index} className="flex items-center justify-center py-2 text-blue-400 text-sm">
                                      <div className="px-4 py-1 bg-blue-900/30 border border-blue-700/50 rounded-full">
                                        {chunk}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Regular content displayed as chat bubbles
                                return (
                                  <div key={index} className="py-2 transition-all duration-300 ease-out animate-fadeIn">
                                    {chunk}
                                  </div>
                                );
                              })}
                              {/* Typewriter animation indicator */}
                              <div className="typing-indicator inline-flex gap-1.5 mt-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing1"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing2"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-typing3"></span>
                              </div>
                            </div>
                            {/* Gradient mask */}
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-900/50 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {scriptContent?.contents.map((line, index) => (
                              <div key={index} className="flex flex-col gap-2">
                                {/* Host name dark background */}
                                <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-900/40 border border-blue-700/40 rounded-xl">
                                  <FiHeadphones className="w-5 h-5 text-blue-400" />
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="text-blue-300 font-medium">
                                      {line.speakerName}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-blue-800/60 text-blue-200 rounded-md border border-blue-700/40">
                                      Host
                                    </span>
                                  </div>
                                </div>
                                {/* Dialogue content input field dark style */}
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
                                    placeholder="Edit dialogue content..."
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
                            * You can directly edit the dialogue content. Host names are fixed and cannot be changed.
                          </div>
                        </>
                      )}
                    </section>

                    {/* ShowNote input section also adjusted style accordingly */}
                    {!isGeneratingScript && scriptContent && (
                      <section className="bg-green-900/20 rounded-2xl border border-green-700/50 p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-green-300 flex items-center mb-6">
                          <FiFileText className="mr-2 sm:mr-3" /> 
                          Podcast ShowNote
                        </h3>
                        <textarea
                          placeholder="Enter podcast shownote..."
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all h-32 resize-none"
                          value={showNote}
                          onChange={e => setShowNote(e.target.value)}
                        />
                        <p className="text-xs text-green-400 mt-2">
                          Adding a ShowNote helps listeners better understand the episode content
                        </p>
                      </section>
                    )}

                    {/* Error message also maintains consistent style */}
                    {error && (
                      <div className="flex items-center gap-2 text-red-300 bg-red-900/30 px-4 py-3 rounded-xl border border-red-700/50">
                        <FiX className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Button style remains unchanged */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-5 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-lg sm:rounded-xl border-blue-200 text-blue-400 font-bold text-base sm:text-lg py-3 sm:py-4"
                        onClick={() => setStep(2)}
                        disabled={isGeneratingScript}
                      >
                        <FiChevronLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Previous
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 rounded-lg sm:rounded-xl bg-blue-400 hover:bg-blue-500 text-white font-bold text-lg sm:text-2xl py-3 sm:py-4 shadow-none"
                        onClick={handleGenerateAudio}
                        disabled={isGenerating || isGeneratingScript || !scriptContent}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Podcast Audio'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Podcast list card */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/50 shadow-xl shadow-blue-900/20">
            <div className="px-6 sm:px-8 lg:px-12 py-6 sm:py-8 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FiHeadphones className="mr-3 h-6 w-6 text-blue-400" />
                My Podcasts
              </h2>
            </div>

            <div className="divide-y divide-gray-700/50">
              {podcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <FiHeadphones className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg">No podcasts yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start creating your first podcast!</p>
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
                          Generating
                        </span>
                      ) : isPodcastCompleted(podcast.status) ? (
                        <button
                          onClick={() => setShowScript(podcast)}
                          className="group px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 text-blue-300 hover:text-blue-200 transition-all duration-300 flex items-center gap-2"
                        >
                          <FiFileText className="h-4 w-4" />
                          Podcast Script & Audio
                        </button>
                      ) : (
                        <span className="flex items-center text-base text-red-300 font-medium bg-red-900/30 px-4 py-2 rounded-xl border border-red-700/50">
                          <FiX className="mr-1 h-4 w-4" />
                          Generation Failed
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
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full
                bg-gradient-to-br from-blue-700 via-purple-700 to-blue-900 text-white
                shadow-lg border-2 border-blue-400/40
                hover:from-blue-500 hover:to-purple-500 hover:border-blue-300
                hover:scale-110 hover:shadow-xl
                transition-all duration-200"
              onClick={() => setShowScript(null)}
              aria-label="Close"
            >
              <FiX className="w-7 h-7" />
            </button>
            <h3 className="text-xl font-bold pt-6 pb-2 px-8 text-blue-200 text-center mb-2">Podcast Script & Audio</h3>
            {/* Audio player */}
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
                <div className="text-blue-300 mb-4">No audio available</div>
              )}
            </div>
            {/* Script bubbles */}
            <div className="overflow-y-auto max-h-[50vh] px-8 pb-8">
              {showScript.script
                ? (() => {
                    // Dynamically assign speaker colors
                    const speakerOrder: string[] = [];
                    return showScript.script
                      .split('\n')
                      .filter(line => line.trim())
                      .map((line, idx) => {
                        const [speakerRaw, ...contentArr] = line.split(':');
                        const speaker = speakerRaw.trim();
                        const content = contentArr.join(':').trim();
                        // Record appearance order
                        if (speaker && !speakerOrder.includes(speaker)) {
                          speakerOrder.push(speaker);
                        }
                        // Only use the first two speakers
                        const isHost1 = speaker === speakerOrder[0];
                        const bubbleColor = isHost1
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800';
                        const align = isHost1 ? 'justify-start' : 'justify-end';
                        const nameColor = isHost1 ? 'text-blue-500' : 'text-green-500';
                        return (
                          <div key={idx} className={`flex ${align} mb-3`}>
                            <div className={`rounded-xl px-4 py-2 ${bubbleColor} max-w-[80%]`}>
                              <span className={`font-semibold mr-2 ${nameColor}`}>{speaker}:</span>
                              <span className="break-words">{content}</span>
                            </div>
                          </div>
                        );
                      });
                  })()
                : <div className="text-blue-300">No script available</div>
              }
            </div>
          </div>
        </div>
      )}

      {/* Add voice selection modal */}
      {(showVoiceModal1 || showVoiceModal2) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto relative p-0">
            {/* Fixed top control bar */}
            <div className="sticky top-0 z-10 bg-white flex justify-between items-center px-6 pt-6 pb-2 border-b border-blue-100">
              <h3 className="text-xl font-bold text-blue-700">
                Select Voice - {showVoiceModal1 ? 'Host 1' : 'Host 2'}
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
            {/* Voice list content ... */}
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