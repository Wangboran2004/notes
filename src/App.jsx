// FIX: Ensure you have installed the required dependencies by running:
// npm install framer-motion lucide-react

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  motion, 
  AnimatePresence, 
  LayoutGroup
} from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Search, 
  Folder,
  FolderPlus, 
  Trash2, 
  Menu,
  Music,
  FileText,
  Star,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Link as LinkIcon,
  ListMusic,
  Loader2,
  Type,        
  AlignLeft,   
  MoveHorizontal,
  Shuffle,
  Repeat,
  Repeat1,
  Highlighter, // For annotation
  MessageSquare, // For comments
  X,
  MoreVertical,
  CornerUpRight, // For move
  Wallpaper, // For background change
  RefreshCw, // For restore
  RotateCcw
} from 'lucide-react';

// --- 0. Global Styles & Constants ---

// Optimized for smoother, liquid-like feel
const TRANSITION_SPRING = {
  type: "spring",
  stiffness: 180, // Lower stiffness for softer movement
  damping: 25,    // Adjusted damping to prevent over-oscillation
  mass: 1
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
const DEFAULT_THEME_BG = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop";

// Mock Data
const INITIAL_DOCS = [
  { 
    id: '1', 
    title: 'Design Philosophy', 
    content: '<p>Liquid Glass.</p><p>Immersive Canvas.</p><p>Physical Space.</p>', 
    date: '2 hrs ago', 
    folder: 'Design', 
    originalFolder: 'Design',
    cover: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    lineHeight: 1.6,
    indent: false,
    annotations: []
  },
  { 
    id: '2', 
    title: 'Travel Logs', 
    content: '<p>Tokyo was amazing. The neon lights reflecting on the rain...</p>', 
    date: 'Yesterday', 
    folder: 'Personal', 
    originalFolder: 'Personal',
    cover: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=2574&auto=format&fit=crop',
    lineHeight: 1.8,
    indent: true,
    annotations: []
  },
];

const INITIAL_PLAYLIST = [
  { 
    id: 1, 
    title: "Lofi Girl - Beats to Relax", 
    artist: "Lofi Girl", 
    cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2670&auto=format&fit=crop", 
    duration: 0,
    src: "jfKfPfyJRdk", 
    type: 'youtube'
  },
  { 
    id: 2, 
    title: "Rain Sounds", 
    artist: "Nature", 
    cover: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2574&auto=format&fit=crop", 
    duration: 0,
    src: "mPZkdNFkNps", 
    type: 'youtube'
  },
  { 
    id: 3, 
    title: "Ambient Piano", 
    artist: "Relaxing Music", 
    cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2670&auto=format&fit=crop", 
    duration: 120,
    src: "https://cdn.pixabay.com/download/audio/2022/02/22/audio_d1718ab41b.mp3?filename=relaxing-mountains-14098.mp3",
    type: 'audio'
  },
];

// --- 1. Components ---

// 1.1 Background Layer
const BackgroundLayer = ({ activeDoc, viewMode, isNewDoc, themeBg }) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      <AnimatePresence>
        {viewMode === 'library' ? (
          <motion.div
            key="library-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0"
          >
             <img 
              src={themeBg || DEFAULT_THEME_BG} 
              className="w-full h-full object-cover opacity-80 blur-xl scale-105" 
              alt="Theme"
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        ) : (
          <motion.div
            key={`editor-bg-${activeDoc?.id}`}
            className="absolute inset-0"
            initial={{ opacity: isNewDoc ? 0 : 1 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeDoc?.cover && (
              <motion.img 
                layoutId={!isNewDoc ? `cover-${activeDoc.id}` : undefined}
                src={activeDoc.cover} 
                className="w-full h-full object-cover" 
                alt="Cover"
                transition={TRANSITION_SPRING}
                // OPTIMIZATION: Force GPU acceleration and hint browser about changes
                style={{ 
                    willChange: 'transform', 
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }}
              />
            )}
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" 
            />
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 bg-black/20" 
            /> 
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for Sidebar Items (UPDATED with Sliding Glass Animation)
const SidebarItem = ({ icon: Icon, label, count, isActive, onClick, onDelete, className }) => (
  <div 
    onClick={(e) => {
      e.stopPropagation(); 
      onClick && onClick();
    }}
    // Parent is relative to contain the absolute background slider
    className={`group/item relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 ${
      !isActive ? 'hover:bg-white/5 text-white/60 hover:text-white' : 'text-white'
    } ${className || ''}`}
  >
    {/* The "Sliding" Background Layer */}
    {isActive && (
      <motion.div
        layoutId="activeSidebarItem" // This ID connects the animation between different items
        className="absolute inset-0 bg-white/20 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] backdrop-blur-xl rounded-xl z-0"
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30
        }}
      />
    )}

    {/* Content sits ABOVE the background (z-10) */}
    <div className="relative z-10 flex items-center gap-3 w-full">
        <Icon size={18} className={isActive ? "text-blue-400" : "currentColor"} />
        <span className={`font-medium truncate`}>{label}</span>
        {count !== undefined && (
          <span className={`ml-auto text-xs ${isActive ? 'text-white/60' : 'text-white/30'}`}>{count}</span>
        )}
        {onDelete && (
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="ml-auto p-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 text-white/0 group-hover/item:text-white/40 transition-all"
            >
                <Trash2 size={14} />
            </button>
        )}
    </div>
  </div>
);

// 1.2 Expanded Music Player Component
const MusicPlayer = ({ 
  isPlaying, 
  setIsPlaying, 
  isCollapsed, 
  currentTrackIdx, 
  setCurrentTrackIdx,
  playlist,
  setPlaylist
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isLiked, setIsLiked] = useState(false);
  const [ytLink, setYtLink] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [repeat, setRepeat] = useState(0); // 0: Sequence/All, 1: Single Loop

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null); 
  const playerContainerRef = useRef(null);
  const progressInterval = useRef(null);
  const currentTrack = playlist && playlist.length > 0 ? playlist[currentTrackIdx] : null;

  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextTrack = useCallback(() => {
    if (!playlist || playlist.length === 0) return;
    let nextIdx = currentTrackIdx;
    
    // Repeat One Logic
    if (repeat === 1) {
        if (currentTrack?.type === 'audio' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else if (currentTrack?.type === 'youtube' && ytPlayerRef.current) {
            ytPlayerRef.current.seekTo(0);
        }
        return;
    }

    // Sequential Logic (Loop All)
    nextIdx = (currentTrackIdx + 1) % playlist.length;

    setCurrentTrackIdx(nextIdx);
    setIsPlaying(true);
  }, [currentTrackIdx, repeat, setCurrentTrackIdx, setIsPlaying, currentTrack, playlist]);

  const prevTrack = () => {
    if (!playlist || playlist.length === 0) return;
    let prevIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
    setCurrentTrackIdx(prevIdx);
    setIsPlaying(true);
  };

  // --- YouTube API Integration (Optimized) ---
  useEffect(() => {
    if (!window.YT && !document.getElementById('youtube-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // --- Playback Control & Sync ---
  useEffect(() => {
    if (!currentTrack) {
        setIsLoading(false);
        if (progressInterval.current) clearInterval(progressInterval.current);
        return;
    }

    if (progressInterval.current) clearInterval(progressInterval.current);
    setIsLoading(true);

    if (currentTrack.type === 'youtube') {
      if (audioRef.current) {
          audioRef.current.pause();
      }

      const initYT = () => {
         if (window.YT && window.YT.Player) {
             if (ytPlayerRef.current) {
                 if(typeof ytPlayerRef.current.loadVideoById === 'function') {
                     ytPlayerRef.current.loadVideoById(currentTrack.src);
                 }
             } else {
                 ytPlayerRef.current = new window.YT.Player('youtube-player-hidden', {
                     height: '100%',
                     width: '100%',
                     videoId: currentTrack.src,
                     playerVars: {
                         'autoplay': 1,
                         'controls': 0,
                         'playsinline': 1,
                         'enablejsapi': 1,
                         'origin': window.location.origin,
                         'host': 'https://www.youtube.com'
                     },
                     events: {
                         'onReady': (event) => {
                             event.target.setVolume(volume);
                             if (isPlaying) event.target.playVideo();
                         },
                         'onStateChange': (event) => {
                             if (event.data === window.YT.PlayerState.PLAYING) {
                                 setIsLoading(false);
                                 setIsPlaying(true);
                             }
                             if (event.data === window.YT.PlayerState.ENDED) {
                                 nextTrack();
                             }
                             if (event.data === window.YT.PlayerState.BUFFERING) {
                                 setIsLoading(true);
                             }
                         },
                         'onError': (e) => {
                             console.error("YouTube Player Error:", e);
                             setIsLoading(false);
                             setTimeout(nextTrack, 2000); 
                         }
                     }
                 });
             }
         } else {
             setTimeout(initYT, 500);
         }
      };
      initYT();
      
      progressInterval.current = setInterval(() => {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
              try {
                const curr = ytPlayerRef.current.getCurrentTime();
                const dur = ytPlayerRef.current.getDuration();
                if (dur > 0) {
                    setCurrentTime(curr);
                    setDuration(dur);
                    setProgress((curr / dur) * 100);
                }
              } catch (e) {}
          }
      }, 1000);

    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
          ytPlayerRef.current.stopVideo();
      }
      if (audioRef.current) {
          audioRef.current.volume = volume / 100;
          if (isPlaying) {
              const p = audioRef.current.play();
              if(p) p.catch(e => {
                  setIsPlaying(false);
              });
          }
      }
    }

    return () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentTrackIdx, currentTrack]); 

  useEffect(() => {
      if (!currentTrack) return;
      try {
        if (currentTrack.type === 'youtube' && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
            if (isPlaying) ytPlayerRef.current.playVideo();
            else ytPlayerRef.current.pauseVideo();
        } else if (currentTrack.type === 'audio' && audioRef.current) {
            if (isPlaying) audioRef.current.play();
            else audioRef.current.pause();
        }
      } catch (e) {
          console.warn("Playback control error", e);
      }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
            ytPlayerRef.current.setVolume(volume);
        }
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
      } catch(e) {}
  }, [volume]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(curr);
      setDuration(dur);
      setProgress(dur > 0 ? (curr / dur) * 100 : 0);
      if (isLoading && curr > 0) setIsLoading(false);
    }
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    setIsPlaying(!isPlaying);
    if (!isCollapsed) setIsExpanded(true);
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    if (currentTrack?.type === 'audio' && audioRef.current) {
       const newTime = (newProgress / 100) * audioRef.current.duration;
       audioRef.current.currentTime = newTime;
       setCurrentTime(newTime);
    } else if (currentTrack?.type === 'youtube' && ytPlayerRef.current) {
       const dur = ytPlayerRef.current.getDuration();
       if (dur) {
           const newTime = (newProgress / 100) * dur;
           ytPlayerRef.current.seekTo(newTime, true);
           setCurrentTime(newTime);
       }
    }
  };

  const handleImportYoutube = (e) => {
    e.preventDefault();
    const id = getYoutubeId(ytLink);
    if(id) {
      const newTrack = {
        id: Date.now(),
        title: "YouTube Import",
        artist: "YouTube",
        cover: `https://img.youtube.com/vi/${id}/0.jpg`,
        duration: 0,
        src: id,
        type: 'youtube'
      };
      const newPlaylist = [...playlist, newTrack];
      setPlaylist(newPlaylist);
      setCurrentTrackIdx(newPlaylist.length - 1);
      setShowLinkInput(false);
      setYtLink("");
      setIsPlaying(true);
      if(!isCollapsed) setIsExpanded(true);
    } else {
      alert("Invalid YouTube URL");
    }
  };

  useEffect(() => {
    if (isCollapsed) setIsExpanded(false);
  }, [isCollapsed]);

  if (!currentTrack) {
    return (
        <div className="relative mt-4 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[100px] gap-2 text-white/30">
             <Music size={24} />
             <span className="text-xs">No Music</span>
             
             <div className="relative w-full mt-2">
                <button 
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="w-full flex items-center justify-center gap-2 text-xs bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                    <LinkIcon size={12} /> Add YouTube
                </button>
                <AnimatePresence>
                    {showLinkInput && (
                        <motion.form 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onSubmit={handleImportYoutube} 
                            className="absolute top-full left-0 w-full mt-2 z-20"
                        >
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Paste YouTube Link..." 
                                className="w-full bg-[#1c1c1e] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none shadow-xl"
                                value={ytLink}
                                onChange={(e) => setYtLink(e.target.value)}
                            />
                        </motion.form>
                    )}
                </AnimatePresence>
             </div>
        </div>
    );
  }

  return (
    <motion.div 
      ref={playerContainerRef}
      layout
      onClick={() => !isCollapsed && setIsExpanded(!isExpanded)}
      className={`relative mt-4 bg-neutral-900/60 border border-white/10 backdrop-blur-2xl overflow-hidden ${
        isExpanded ? 'rounded-3xl p-5' : 'rounded-2xl p-3'
      } transition-all hover:bg-neutral-800/60 cursor-pointer group shadow-2xl z-20`}
      style={{ transformOrigin: "bottom center" }} 
    >
      <audio 
        ref={audioRef} 
        src={currentTrack.type === 'audio' ? currentTrack.src : undefined}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={nextTrack}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      <div className="absolute pointer-events-none opacity-0" style={{ width: 1, height: 1, left: -1000 }}>
        <div id="youtube-player-hidden" />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <img src={currentTrack.cover} className="w-full h-full object-cover blur-3xl scale-125" alt="Blur" />
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            layout
            className={`${isExpanded ? 'w-16 h-16 rounded-xl' : 'w-10 h-10 rounded-lg'} overflow-hidden shadow-lg shrink-0 relative bg-black`}
          >
            <img src={currentTrack.cover} className="w-full h-full object-cover" alt="Art" />
            {currentTrack.type === 'youtube' && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                     <Play size={8} fill="white" className="text-white ml-0.5" />
                  </div>
               </div>
            )}
            {isLoading && isPlaying && (
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                 <Loader2 className="animate-spin text-white" size={isExpanded ? 20 : 14} />
               </div>
            )}
          </motion.div>
          
          <motion.div layout className="flex-1 min-w-0 flex flex-col justify-center">
            <motion.div layout className={`font-bold text-white truncate ${isExpanded ? 'text-lg' : 'text-xs'}`}>
              {currentTrack.title}
            </motion.div>
            <motion.div layout className={`text-white/50 truncate ${isExpanded ? 'text-sm' : 'text-[10px]'}`}>
              {currentTrack.artist}
            </motion.div>
          </motion.div>

          {!isExpanded && (
            <button 
              onClick={togglePlay} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
            >
              {isLoading && isPlaying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />
              )}
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-5 pt-2"
            >
              <div className="space-y-2 group/progress" onClick={(e) => e.stopPropagation()}>
                <div className="relative h-1 w-full bg-white/20 rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-full bg-white rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-mono font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                 <div className="w-8" /> {/* Spacer */}

                 <div className="flex items-center justify-center gap-6 flex-1">
                    <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-white/60 hover:text-white transition-colors">
                      <SkipBack size={24} fill="currentColor" />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      {isLoading && isPlaying ? (
                        <Loader2 size={24} className="animate-spin text-black" />
                      ) : (
                        /* FIXED: Removed ml-1 to center icon properly */
                        isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />
                      )}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-white/60 hover:text-white transition-colors">
                      <SkipForward size={24} fill="currentColor" />
                    </button>
                 </div>

                 {/* FIXED: Toggle between Sequence (0) and Single Loop (1) */}
                 <button 
                    onClick={(e) => { e.stopPropagation(); setRepeat((repeat + 1) % 2); }}
                    className={`p-2 rounded-full transition-colors ${repeat === 1 ? 'text-green-400 bg-white/10' : 'text-white/40 hover:text-white'}`}
                    title={repeat === 1 ? "Single Loop" : "Sequential Play"}
                 >
                    {repeat === 1 ? <Repeat1 size={16} /> : <ListMusic size={16} />}
                 </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 w-2/5 group/vol">
                  <Volume2 size={16} className="text-white/50 group-hover/vol:text-white transition-colors" />
                  <div className="relative h-1 w-full bg-white/20 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${volume}%` }} />
                    <input 
                        type="range" 
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                   <div className="relative flex items-center">
                     <AnimatePresence>
                        {showLinkInput && (
                            <motion.form 
                                initial={{ width: 0, opacity: 0, x: 10 }}
                                animate={{ width: 180, opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: 10 }}
                                onSubmit={handleImportYoutube} 
                                className="absolute bottom-10 right-0 bg-[#1c1c1e] p-1.5 rounded-xl shadow-2xl border border-white/10 overflow-hidden"
                            >
                            <input 
                                type="text" 
                                placeholder="Paste YouTube Link..." 
                                className="bg-transparent rounded-lg px-2 py-1 text-xs w-full outline-none text-white placeholder:text-white/30"
                                value={ytLink}
                                onChange={(e) => setYtLink(e.target.value)}
                                autoFocus
                            />
                            </motion.form>
                        )}
                     </AnimatePresence>
                     <button 
                        onClick={() => setShowLinkInput(!showLinkInput)}
                        className={`p-2 rounded-full transition-colors ${showLinkInput ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                        title="Import YouTube Link"
                      >
                        <LinkIcon size={18} />
                      </button>
                   </div>

                   <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500/20 text-pink-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                  >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 1.3 Sidebar
const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  activeFilter,
  onFilterChange,
  isPlaying, 
  setIsPlaying,
  currentTrackIdx,
  setCurrentTrackIdx,
  folders,
  onCreateFolder,
  onDeleteFolder,
  playlist,
  setPlaylist
}) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const sidebarVariants = {
    expanded: {
      width: 280,
      height: "96vh",
      borderRadius: 24,
      left: 12,
      top: "2vh",
      transition: TRANSITION_SPRING
    },
    collapsed: {
      width: 60,
      height: 60,
      borderRadius: 30,
      left: 12,
      top: "50%",
      y: "-50%",
      transition: TRANSITION_SPRING
    }
  };

  const handleCreateFolder = (e) => {
      e.preventDefault();
      if (newFolderName.trim()) {
          onCreateFolder(newFolderName);
          setNewFolderName("");
          setIsCreatingFolder(false);
      }
  };

  return (
    <motion.div
      layout
      initial={false}
      animate={isOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      className="fixed z-[60] backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      style={{ transformOrigin: "left center" }}
    >
        <div className={`flex flex-col h-full w-full absolute inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
             <div className="flex flex-col h-full p-4 text-white/90 w-full">
                <div className="flex items-center justify-between mb-6 mt-2 px-1 shrink-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/50 uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        Library
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleSidebar(); }} 
                        className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pb-4 min-h-0 pr-2">
                    <SidebarItem 
                        icon={FileText} 
                        label="All Notes" 
                        isActive={activeFilter === 'all'} 
                        onClick={() => onFilterChange('all')}
                    />
                    <SidebarItem 
                        icon={Star} 
                        label="Favorites" 
                        isActive={activeFilter === 'favorites'} 
                        onClick={() => onFilterChange('favorites')}
                    />
                    
                    {/* ADDED: Music as a main section */}
                    <SidebarItem 
                        icon={Music} 
                        label="Music" 
                        isActive={activeFilter === 'music'} 
                        onClick={() => onFilterChange('music')}
                    />
                    
                    {/* Folders Section */}
                    <div className="mt-6 mb-2 px-1 flex items-center justify-between text-xs font-bold text-white/30 uppercase tracking-widest group">
                        <span>Folders</span>
                        <button onClick={() => setIsCreatingFolder(true)} className="hover:text-white transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    
                    {isCreatingFolder && (
                        <form onSubmit={handleCreateFolder} className="mb-2 px-1">
                            <input 
                                autoFocus
                                type="text" 
                                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none"
                                placeholder="Folder name..."
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onBlur={() => setIsCreatingFolder(false)}
                            />
                        </form>
                    )}

                    {folders.map(f => (
                        <SidebarItem 
                        key={f}
                        icon={Folder} 
                        label={f} 
                        isActive={activeFilter === f} 
                        onClick={() => onFilterChange(f)}
                        onDelete={() => onDeleteFolder(f)}
                        />
                    ))}
                    <SidebarItem 
                        icon={Trash2} 
                        label="Trash" 
                        isActive={activeFilter === 'trash'} 
                        onClick={() => onFilterChange('trash')}
                        className={`mt-8 ${activeFilter === 'trash' ? 'text-red-400' : 'hover:text-red-400'}`}
                    />
                    {/* REMOVED: Bottom Playlist List. Now part of Main View 'Music' */}
                </div>

                <div className="mt-auto pt-2 shrink-0">
                    <MusicPlayer 
                        isPlaying={isPlaying} 
                        setIsPlaying={setIsPlaying} 
                        isCollapsed={!isOpen} 
                        currentTrackIdx={currentTrackIdx}
                        setCurrentTrackIdx={setCurrentTrackIdx}
                        playlist={playlist}
                        setPlaylist={setPlaylist}
                    />
                </div>
             </div>
        </div>

        {!isOpen && (
             <motion.button
                key="ball"
                onClick={toggleSidebar}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                className="absolute inset-0 z-20 w-full h-full flex items-center justify-center text-white/80 hover:text-white group cursor-pointer"
            >
                {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <motion.div 
                    className="w-full h-full rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    />
                </div>
                )}
                <Menu size={24} className="group-hover:scale-110 transition-transform" />
            </motion.button>
        )}
    </motion.div>
  );
};

// 1.4 Document Card
const DocCard = ({ doc, onClick, onMove, onDelete, folders, isTrash }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layoutId={`card-${doc.id}`}
      onClick={() => !isTrash && onClick(doc)}
      className={`group relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900/50 border border-white/5 hover:border-white/20 transition-colors shadow-2xl ${!isTrash ? 'cursor-pointer' : ''}`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.img
        layoutId={`cover-${doc.id}`}
        src={doc.cover}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isTrash ? 'opacity-40 grayscale' : 'opacity-80 group-hover:opacity-100'}`}
        alt={doc.title}
        loading="lazy" // Optimization for list
        style={{ willChange: 'transform' }} // Optimization for animation
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      {/* Card Menu */}
      <div className="absolute top-3 right-3 z-20">
          {isTrash ? (
             <div className="flex gap-2">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onClick(doc, 'restore'); }}
                    className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/40 backdrop-blur-md transition-all"
                    title="Restore"
                 >
                    <RotateCcw size={16} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                    className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 backdrop-blur-md transition-all"
                    title="Delete Permanently"
                 >
                    <Trash2 size={16} />
                 </button>
             </div>
          ) : (
            <>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white/50 hover:text-white hover:bg-black/40 opacity-0 group-hover:opacity-100 transition-all"
                >
                    <MoreHorizontal size={16} />
                </button>
                {showMenu && (
                    <div 
                        className="absolute top-full right-0 mt-2 w-32 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-xl overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-3 py-2 text-[10px] text-white/30 font-bold uppercase tracking-wider">Move to</div>
                        {folders.map(f => (
                            <button 
                                key={f}
                                onClick={() => { onMove(doc.id, f); setShowMenu(false); }}
                                className="px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10"
                            >
                                {f}
                            </button>
                        ))}
                        <div className="h-px bg-white/10 my-1" />
                        <button 
                            onClick={() => { onDelete(doc.id); setShowMenu(false); }}
                            className="px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                )}
            </>
          )}
      </div>

      <div className="absolute bottom-0 left-0 p-5 w-full">
        <motion.h3 layoutId={`title-${doc.id}`} className="text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">
          {doc.title || "Untitled"}
        </motion.h3>
        <div className="flex items-center justify-between text-xs text-white/50 font-medium">
          <span>{doc.date}</span>
          <span className="px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/5">{doc.folder}</span>
        </div>
      </div>
    </motion.div>
  );
};

// 1.5 Editor View
const Editor = ({ doc, onClose, onUpdate, isNew }) => {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [cover, setCover] = useState(doc.cover);
  const [annotations, setAnnotations] = useState(doc.annotations || []);
  
  const [lineHeight, setLineHeight] = useState(doc.lineHeight || 1.6);
  const [textIndent, setTextIndent] = useState(doc.indent || false);
  const [showTypography, setShowTypography] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleClose = () => {
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCover(url);
      onUpdate(doc.id, { cover: url });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        onUpdate(doc.id, { 
          title, 
          content, // Saving HTML content
          lineHeight,
          indent: textIndent,
          annotations
        });
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, lineHeight, textIndent, annotations]);

  // --- Annotation Logic ---
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const text = selection.toString();
    
    if (text.trim().length > 0) {
        const span = document.createElement('span');
        span.className = "bg-yellow-500/30 text-white decoration-clone py-0.5 rounded cursor-pointer hover:bg-yellow-500/50 transition-colors";
        span.onclick = () => setShowAnnotations(true);
        range.surroundContents(span);
        
        // Clear selection
        selection.removeAllRanges();
        
        // Save annotation data
        const newAnnotation = {
            id: Date.now(),
            text: text,
            comment: "",
            timestamp: new Date().toLocaleString()
        };
        setAnnotations([...annotations, newAnnotation]);
        setShowAnnotations(true); // Open sidebar
        
        // Update content state from DOM
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    }
  };

  const updateAnnotationComment = (id, comment) => {
      setAnnotations(anns => anns.map(a => a.id === id ? { ...a, comment } : a));
  };
  
  const deleteAnnotation = (id) => {
      setAnnotations(anns => anns.filter(a => a.id !== id));
  };

  const pageVariants = isNew 
    ? { 
        initial: { y: "100vh", opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100vh", opacity: 1 }
      }
    : { 
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };

  return (
    <motion.div
      className="absolute top-0 left-0 z-20 w-full min-h-screen flex flex-col"
      initial={pageVariants.initial}
      animate={pageVariants.animate}
      exit={pageVariants.exit}
      transition={{ duration: 0.4 }}
      onClick={() => { setShowTypography(false); }}
    >
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 px-8 h-20 flex items-center justify-between bg-transparent" 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0, transition: { duration: 0.2 } }}
        transition={{ delay: 0.3 }}
      >
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3 relative">
            {/* Annotate Button */}
            <button 
                onClick={handleHighlight}
                className="px-4 py-2 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                title="Select text then click to highlight"
            >
                <Highlighter size={14} />
                Highlight
            </button>

            <button 
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showAnnotations ? 'bg-white text-black' : 'hover:bg-white/10 text-white/80 hover:text-white'}`}
            >
                <MessageSquare size={18} />
                {annotations.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                )}
            </button>
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <button 
                onClick={() => fileInputRef.current.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white/80 hover:text-white"
            >
                <ImageIcon size={18} />
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTypography(!showTypography); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                showTypography ? 'bg-white text-black' : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
            >
               <Type size={18} />
            </button>

            <AnimatePresence>
              {showTypography && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-14 right-0 w-72 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 flex flex-col gap-6"
                >
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-wider">
                         <MoveHorizontal size={12} />
                         Line Height
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                         {[1.2, 1.6, 2.0, 2.4].map(val => (
                           <button
                             key={val}
                             onClick={() => setLineHeight(val)}
                             className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                               lineHeight === val 
                                ? 'bg-white/20 text-white shadow-sm' 
                                : 'text-white/40 hover:text-white/80'
                             }`}
                           >
                             {val}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-wider">
                         <AlignLeft size={12} />
                         First Line Indent
                      </div>
                      <button 
                        onClick={() => setTextIndent(!textIndent)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${textIndent ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                         <motion.div 
                           animate={{ x: textIndent ? 24 : 0 }}
                           className="w-4 h-4 bg-white rounded-full shadow-sm"
                         />
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80">
                <MoreHorizontal size={20} />
            </button>
        </div>
      </motion.header>

      <div className="flex flex-1 w-full relative">
          {/* Main Content */}
          <div className={`flex-1 max-w-4xl mx-auto w-full px-8 pb-32 pt-12 relative z-10 transition-all duration-300 ${showAnnotations ? 'mr-80' : ''}`}>
            <div className="mb-12">
                <motion.h1 
                    layoutId={!isNew ? `title-${doc.id}` : undefined}
                    className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight drop-shadow-xl placeholder-white/30 bg-transparent outline-none relative"
                >
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-transparent w-full outline-none placeholder:text-white/30"
                        placeholder="Untitled"
                    />
                </motion.h1>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex items-center gap-4 mt-6 text-white/60 text-sm font-medium tracking-wide"
                >
                    <span>{doc.date}</span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>{content.length} chars</span>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                {/* Rich Text Editor Div */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setContent(e.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: content }}
                    className="w-full min-h-[60vh] bg-transparent text-lg md:text-xl text-white/90 outline-none resize-none empty:before:content-[attr(placeholder)] empty:before:text-white/40"
                    style={{
                        lineHeight: lineHeight,
                        textIndent: textIndent ? '2em' : '0px',
                        transition: 'line-height 0.3s ease, text-indent 0.3s ease'
                    }}
                    placeholder="Start writing your masterpiece..."
                />
            </motion.div>
          </div>
          
          {/* Annotation Sidebar - Updated for Glassmorphism & Rounded Textarea */}
          <AnimatePresence>
            {showAnnotations && (
                <motion.div
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    // UPDATED: Changed styles for floating rounded appearance
                    className="fixed right-4 top-24 bottom-6 w-80 bg-black/10 backdrop-blur-3xl border border-white/10 z-30 p-6 overflow-y-auto custom-scrollbar shadow-[-20px_0_40px_rgba(0,0,0,0.2)] rounded-3xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider drop-shadow-sm">Annotations</h3>
                        <button onClick={() => setShowAnnotations(false)}><X size={16} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <div className="space-y-4">
                        {annotations.length === 0 ? (
                            <div className="text-white/30 text-sm text-center py-10">Select text and click highlight to add notes.</div>
                        ) : (
                            annotations.map((ann) => (
                                <div 
                                    key={ann.id} 
                                    className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 group shadow-lg"
                                >
                                    <div className="text-yellow-500/90 text-xs mb-2 italic border-l-2 border-yellow-500/50 pl-2 drop-shadow-sm">"{ann.text}"</div>
                                    {/* CHANGED: Textarea with Rounded corners and background */}
                                    <textarea
                                        value={ann.comment}
                                        onChange={(e) => updateAnnotationComment(ann.id, e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-black/10 rounded-xl px-3 py-2 mt-2 text-sm text-white/90 outline-none resize-none placeholder:text-white/20 border border-transparent focus:border-white/10 transition-all"
                                        rows={2}
                                    />
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                                        <span className="text-[10px] text-white/40 font-medium">{ann.timestamp}</span>
                                        <button onClick={() => deleteAnnotation(ann.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>
    </motion.div>
  );
};

// --- 2. Main App Logic ---

export default function App() {
  const [documents, setDocuments] = useState(INITIAL_DOCS);
  const [playlist, setPlaylist] = useState(INITIAL_PLAYLIST);
  const [folders, setFolders] = useState(['Design', 'Personal', 'Work', 'Ideas']);
  
  const [activeDocId, setActiveDocId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userOverride, setUserOverride] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNewDoc, setIsNewDoc] = useState(false); 
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);

  // THEME STATE
  const [themeBg, setThemeBg] = useState(DEFAULT_THEME_BG);
  const themeInputRef = useRef(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('immersive-writer-docs');
    const savedPlaylist = localStorage.getItem('immersive-writer-playlist');
    const savedFolders = localStorage.getItem('immersive-writer-folders');
    const savedTheme = localStorage.getItem('immersive-writer-theme');
    
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedTheme) setThemeBg(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('immersive-writer-docs', JSON.stringify(documents));
    localStorage.setItem('immersive-writer-playlist', JSON.stringify(playlist));
    localStorage.setItem('immersive-writer-folders', JSON.stringify(folders));
    localStorage.setItem('immersive-writer-theme', themeBg);
  }, [documents, playlist, folders, themeBg]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setUserOverride(true);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const openDoc = (doc, action) => {
    if (action === 'restore') {
        restoreDoc(doc.id);
        return;
    }
    setIsNewDoc(false);
    setActiveDocId(doc.id);
    if (!userOverride) setIsSidebarOpen(false);
  };

  const createDoc = () => {
    const newId = Date.now().toString();
    const newDoc = {
        id: newId,
        title: '',
        content: '',
        date: 'Just now',
        folder: 'Unsorted',
        originalFolder: 'Unsorted',
        cover: DEFAULT_COVER,
        lineHeight: 1.6,
        indent: false,
        annotations: []
    };
    setDocuments([newDoc, ...documents]);
    setIsNewDoc(true);
    setActiveDocId(newId);
    if (!userOverride) setIsSidebarOpen(false);
  };

  const closeDoc = () => {
    setActiveDocId(null);
    if (!userOverride) setIsSidebarOpen(true);
  };

  const updateDoc = (id, updates) => {
    setDocuments(docs => docs.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  // UPDATED: Delete Logic (Trash vs Permanent)
  const deleteDoc = (id) => {
      const doc = documents.find(d => d.id === id);
      if (!doc) return;

      if (doc.folder === 'Trash') {
          if (window.confirm("Permanently delete this document? This cannot be undone.")) {
              setDocuments(docs => docs.filter(d => d.id !== id)); 
          }
      } else {
          if (window.confirm("Move document to Trash?")) {
              setDocuments(docs => docs.map(d => d.id === id ? { ...d, folder: 'Trash', originalFolder: d.folder } : d));
          }
      }
  };

  // ADDED: Restore Logic
  const restoreDoc = (id) => {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, folder: d.originalFolder || 'Unsorted' } : d));
  };

  const moveDoc = (id, folder) => {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, folder } : d));
  };
  
  // ADDED: Delete Track
  const deleteTrack = (index) => {
      if(window.confirm("Remove this track from library?")) {
          const newPlaylist = playlist.filter((_, i) => i !== index);
          setPlaylist(newPlaylist);
          if (currentTrackIdx >= newPlaylist.length) {
              setCurrentTrackIdx(Math.max(0, newPlaylist.length - 1));
              if (newPlaylist.length === 0) setIsPlaying(false);
          }
      }
  }

  const createFolder = (name) => {
      if (!folders.includes(name)) {
          setFolders([...folders, name]);
      }
  };
  
  const deleteFolder = (name) => {
      if (window.confirm(`Delete folder "${name}"? Documents will be moved to Unsorted.`)) {
          setFolders(folders.filter(f => f !== name));
          setDocuments(docs => docs.map(d => d.folder === name ? { ...d, folder: 'Unsorted' } : d));
      }
  };

  const handleThemeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThemeBg(url);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (activeFilter === 'music') return false; // Don't show docs in music view
    if (activeFilter === 'trash') return doc.folder === 'Trash';
    if (doc.folder === 'Trash') return false; // Don't show trash in other views
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favorites') return false; 
    return doc.folder === activeFilter;
  });

  const contentMarginLeft = isSidebarOpen ? 300 : 80; 
  const activeDoc = documents.find(d => d.id === activeDocId);

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-orange-500/30">
      
      <BackgroundLayer activeDoc={activeDoc} viewMode={activeDocId ? 'editor' : 'library'} isNewDoc={isNewDoc} themeBg={themeBg} />

      <LayoutGroup>
        <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={handleSidebarToggle} 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            viewMode={activeDocId ? 'editor' : 'library'}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTrackIdx={currentTrackIdx}
            setCurrentTrackIdx={setCurrentTrackIdx}
            folders={folders}
            onCreateFolder={createFolder}
            onDeleteFolder={deleteFolder}
            playlist={playlist}
            setPlaylist={setPlaylist}
        />

        <motion.main
            className="relative z-10 min-h-screen"
            initial={false}
            animate={{ marginLeft: contentMarginLeft }}
            transition={TRANSITION_SPRING}
        >
            <AnimatePresence>
                {!activeDocId ? (
                    <motion.div 
                        key="library"
                        className="px-8 py-12 pt-24"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeFilter} 
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <h1 className="text-4xl font-bold tracking-tight">
                                            {activeFilter === 'all' ? 'Library' : 
                                            activeFilter === 'music' ? 'Music Collection' : 
                                            activeFilter === 'trash' ? 'Trash' : activeFilter}
                                        </h1>
                                        <span className="text-white/40 text-sm font-medium mt-1">
                                        {activeFilter === 'music' ? `${playlist.length} Tracks` : 
                                        activeFilter === 'trash' ? `${filteredDocs.length} Deleted Items` :
                                        `${filteredDocs.length} Notes`}
                                        </span>
                                    </div>
                                    
                                    {activeFilter !== 'music' && activeFilter !== 'trash' && (
                                        <div className="flex gap-3">
                                            <input 
                                                type="file" 
                                                ref={themeInputRef} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleThemeUpload}
                                            />
                                            <button 
                                                onClick={() => themeInputRef.current.click()}
                                                className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/5"
                                                title="Change Wallpaper (Supports 8K)"
                                            >
                                                <ImageIcon size={20} />
                                            </button>

                                            <button className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/5">
                                                <Search size={20} />
                                            </button>
                                            <button 
                                                onClick={createDoc}
                                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transform duration-200"
                                            >
                                                <Plus size={20} />
                                                <span>New Note</span>
                                            </button>
                                        </div>
                                    )}
                                    {/* Restore All Button for Trash could go here */}
                                </div>

                                {activeFilter === 'music' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {playlist.map((track, idx) => (
                                        <div 
                                        key={track.id} 
                                        className={`group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900/50 border border-white/5 hover:border-white/20 transition-colors shadow-xl ${currentTrackIdx === idx ? 'ring-2 ring-white/50' : ''}`}
                                        >
                                            <img src={track.cover} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                                            
                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { setCurrentTrackIdx(idx); setIsPlaying(true); }}
                                                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                >
                                                    {currentTrackIdx === idx && isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                                                </button>
                                            </div>

                                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                                <div className="font-bold text-white text-lg truncate">{track.title}</div>
                                                <div className="text-sm text-white/50">{track.artist}</div>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteTrack(idx); }}
                                                className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white/50 hover:text-red-400 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {playlist.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center text-white/30 py-20">
                                            <Music size={48} className="mb-4 opacity-50" />
                                            <p>No music collected yet.</p>
                                            <p className="text-xs mt-2">Add from the player sidebar.</p>
                                        </div>
                                    )}
                                </div>
                                ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                                        <DocCard 
                                            key={doc.id} 
                                            doc={doc} 
                                            onClick={openDoc} 
                                            onMove={moveDoc}
                                            onDelete={deleteDoc}
                                            folders={folders}
                                            isTrash={activeFilter === 'trash'}
                                        />
                                    )) : (
                                        <div className="col-span-full text-center text-white/20 py-20">
                                            {activeFilter === 'trash' ? 'Trash is empty' : 'No documents found'}
                                        </div>
                                    )}
                                </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <Editor 
                        key="editor" 
                        doc={activeDoc} 
                        onClose={closeDoc} 
                        onUpdate={updateDoc}
                        isNew={isNewDoc}
                    />
                )}
            </AnimatePresence>
        </motion.main>
      </LayoutGroup>

      <style>{`
        html, body {
            background-color: #000 !important;
            overflow-x: hidden; 
            color-scheme: dark;
            overflow-y: overlay;
        }
        ::-webkit-scrollbar { 
            width: 0px; 
            background: transparent; 
        }
        * {
            scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
           width: 4px;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}