import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, 
  MapPin, Heart, Music 
} from 'lucide-react';
import PasswordScreen from './components/PasswordScreen';
import EnvelopeScreen from './components/EnvelopeScreen';
import ScratchCard from './components/ScratchCard';

function App() {
  const [gameState, setGameState] = useState('LOCK'); // LOCK -> ENVELOPE -> DASHBOARD
  const [isMuted, setIsMuted] = useState(true); // Default muted to allow autoplay bypass
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(218); // Fallback: 3:38
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState([]);
  const [showRepeatMessage, setShowRepeatMessage] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [selectedMarkerPhoto, setSelectedMarkerPhoto] = useState(null);
  const [kisses, setKisses] = useState([]);
  const [roses, setRoses] = useState([]);

  // Map state
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: -180, y: -180 });
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const mapRef = useRef(null);
  const viewportRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const ytPlayerRef = useRef(null);
  const videoRef = useRef(null);

  // Dynamic centering of the map pin with window resize support
  useEffect(() => {
    if (gameState !== 'DASHBOARD') return;
    
    const centerPin = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const viewportWidth = rect.width || 600;
        const viewportHeight = rect.height || 340;
        
        // Pin is top: '30%', left: '40%' of 1200x1200px map
        const targetX = 480;
        const targetY = 360;
        
        const newX = (viewportWidth / 2) - targetX;
        const newY = (viewportHeight / 2) - targetY;
        
        // Bound it dynamically
        const boundedX = Math.min(0, Math.max(-1200 + viewportWidth, newX));
        const boundedY = Math.min(0, Math.max(-1200 + viewportHeight, newY));
        
        setMapOffset({ x: boundedX, y: boundedY });
      }
    };

    // Center on load/mount
    centerPin();
    // Centering delay for smooth layout transitions
    const timer = setTimeout(centerPin, 250);

    window.addEventListener('resize', centerPin);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', centerPin);
    };
  }, [gameState]);

  // User uploaded photos swapped in exactly
  const IMAGES = {
    couple1: 'photo1.jpg', // Polaroid 1 (First user photo)
    couple2: 'photo2.jpg', // Polaroid 2 (Second user photo)
    couple3: 'photo3.jpg', // Polaroid 3 (Third user photo)
  };

  // Initialize YT Player on load
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const initPlayer = () => {
    if (ytPlayerRef.current) return;
    ytPlayerRef.current = new window.YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: 'FOiJKl6EHBk',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          setDuration(event.target.getDuration() || 218);
          if (gameState === 'DASHBOARD') {
            event.target.unMute();
            event.target.playVideo();
            setIsPlaying(true);
            setIsMuted(false);
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(event.target.getDuration() || 218);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            event.target.playVideo(); // Loop
          }
        }
      }
    });
  };

  // Sync play/mute when gameState turns DASHBOARD
  useEffect(() => {
    if (gameState === 'DASHBOARD' && ytPlayerRef.current && ytPlayerRef.current.playVideo) {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
      setIsMuted(false);
    }
  }, [gameState]);

  // Keep track of current playing time
  useEffect(() => {
    let interval;
    if (isPlaying && ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
      interval = setInterval(() => {
        setCurrentTime(ytPlayerRef.current.getCurrentTime());
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Floating music notes effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const noteIcons = ['♫', '♪', '🎶', '♥', '🎵'];
      const newNote = {
        id,
        icon: noteIcons[Math.floor(Math.random() * noteIcons.length)],
        left: Math.random() * 80 + 10,
      };
      setFloatingNotes(prev => [...prev.slice(-12), newNote]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Audio actions
  const togglePlay = () => {
    if (!ytPlayerRef.current || !ytPlayerRef.current.playVideo) return;
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current || !ytPlayerRef.current.mute) return;
    if (isMuted) {
      ytPlayerRef.current.unMute();
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e) => {
    if (!ytPlayerRef.current || !ytPlayerRef.current.seekTo || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;
    const newTime = clickPercentage * duration;
    ytPlayerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handlePrevSong = () => {
    if (!ytPlayerRef.current || !ytPlayerRef.current.seekTo) return;
    ytPlayerRef.current.seekTo(0, true);
    setCurrentTime(0);
  };

  const handleNextSong = () => {
    setShowRepeatMessage(true);
    setTimeout(() => {
      setShowRepeatMessage(false);
    }, 3000);
  };

  const triggerKisses = () => {
    // Generate 45 flying lipstick kiss marks across the screen
    const newKisses = Array.from({ length: 45 }).map((_, i) => {
      const id = Date.now() + i + Math.random();
      return {
        id,
        x: Math.random() * 100, // horizontal starting position (vw)
        scale: 0.5 + Math.random() * 0.8, // realistic size scale
        rotation: Math.random() * 80 - 40, // random angle of lipstick stamp
        duration: 2.5 + Math.random() * 2.5, // float speeds
        delay: Math.random() * 0.8, // staggered timing
      };
    });
    
    setKisses(prev => [...prev, ...newKisses]);
    
    // Clean up older kiss elements after transition completes
    setTimeout(() => {
      setKisses(prev => prev.filter(k => !newKisses.find(nk => nk.id === k.id)));
    }, 6000);
  };

  const triggerRoses = () => {
    // Generate 45 flying roses / petals across the screen
    const newRoses = Array.from({ length: 45 }).map((_, i) => {
      const id = Date.now() + i + Math.random();
      const roseIcons = ['🌹', '🌸', '💐', '🌺', '🌷', '🏵️'];
      return {
        id,
        x: Math.random() * 100, // horizontal starting position (vw)
        scale: 0.6 + Math.random() * 1.2,
        rotation: Math.random() * 360, // starting angle
        duration: 2.2 + Math.random() * 2.3, // float speeds
        delay: Math.random() * 0.9, // staggered timing
        icon: roseIcons[Math.floor(Math.random() * roseIcons.length)]
      };
    });
    
    setRoses(prev => [...prev, ...newRoses]);
    
    // Clean up older rose elements after transition completes
    setTimeout(() => {
      setRoses(prev => prev.filter(r => !newRoses.find(nr => nr.id === r.id)));
    }, 5500);
  };

  // Video Actions
  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      });
    }
  };

  // Map Actions
  const handleMapMouseDown = (e) => {
    setIsDraggingMap(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX - mapOffset.x, y: clientY - mapOffset.y };
  };

  const handleMapMouseMove = (e) => {
    if (!isDraggingMap) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const newX = clientX - dragStart.current.x;
    const newY = clientY - dragStart.current.y;
    
    // Bounds check
    const boundedX = Math.min(0, Math.max(-800, newX));
    const boundedY = Math.min(0, Math.max(-800, newY));
    
    setMapOffset({ x: boundedX, y: boundedY });
  };

  const handleMapMouseUp = () => {
    setIsDraggingMap(false);
  };

  const handleZoom = (factor) => {
    setMapScale(prev => Math.min(2.0, Math.max(0.6, prev + factor)));
  };

  return (
    <div className="relative min-h-screen bg-[#1b0204] overflow-x-hidden">
      
      {/* 3D DREAMY Twinkling Star stickers in the background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="star-blink absolute text-pink-300 select-none text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            ★
          </div>
        ))}
      </div>

      {/* FLOATING RED HEART STICKERS */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0 overflow-hidden">
        {[...Array(22)].map((_, i) => (
          <div
            key={i}
            className="float-slow absolute text-[#ff3b5c] select-none text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              '--rot': `${Math.random() * 20 - 10}deg`
            }}
          >
            ❤
          </div>
        ))}
      </div>

      {/* HIDDEN YOUTUBE PLAYER FOR BACKGROUND AUDIO */}
      <div id="yt-player" className="hidden" />

      {/* RENDER PAGES BASED ON STATE */}
      <AnimatePresence mode="wait">
        
        {/* 1. PASSWORD SCREEN */}
        {gameState === 'LOCK' && (
          <motion.div
            key="lock"
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
          >
            <PasswordScreen onCorrectPassword={() => setGameState('ENVELOPE')} />
          </motion.div>
        )}

        {/* 2. ENVELOPE INVITATION SCREEN */}
        {gameState === 'ENVELOPE' && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EnvelopeScreen onOpenDashboard={() => setGameState('DASHBOARD')} />
          </motion.div>
        )}

        {/* 3. MAIN INTERACTIVE DASHBOARD */}
        {gameState === 'DASHBOARD' && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center"
          >
            
            {/* Header section with dreamy styling */}
            <header className="text-center mb-16 relative">
              {/* Cute handdrawn heart above header */}
              <div className="text-pink-300 text-3xl mb-1 animate-pulse select-none">🎀</div>
              
              <motion.h1 
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="font-fancy text-5xl md:text-6xl text-white font-extrabold drop-shadow-[0_0_15px_rgba(171,22,39,0.7)] tracking-wide"
              >
                Our Sweet Place
              </motion.h1>
              <p className="font-handwritten text-3xl text-[#fbc6cb] mt-2 italic font-bold tracking-wide">
                Every moment with you is a beautiful adventure 🌸
              </p>
            </header>

            {/* Mute and Song control overlay float button */}
            <div className="fixed bottom-6 right-6 z-30">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="p-3.5 bg-[#780d19] text-pink-100 rounded-full shadow-2xl border border-pink-200/25 hover:bg-[#ab1627] transition-all duration-200"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* MAIN SCRAPBOOK COMPOSITION */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
              
              {/* SECTION 1: VERTICAL VIDEO COMPONENT (Side-by-side with Music Player) */}
              <section className="col-span-1 md:col-span-8 scrapbook-paper p-5 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 group">
                {/* Washi tape mockup at the top corner */}
                <div className="absolute top-[-10px] left-8 w-16 h-6 bg-pink-100/10 backdrop-blur-sm border-x border-dashed border-white/20 rotate-[-5deg] pointer-events-none z-10" />
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">🎥</span>
                  <h3 className="font-fancy text-lg font-bold text-white tracking-wide">Favorite Person</h3>
                </div>

                <div className="relative w-full aspect-[9/16] bg-black rounded-xl overflow-hidden border border-[#ab1627]/30 shadow-inner flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    loop 
                    controls
                    className="w-full h-full object-cover"
                    src="video_user.mp4" 
                  />
                </div>
              </section>

              {/* SECTION 2 CONTAINER */}
              <div className="col-span-1 md:col-span-4 flex flex-col gap-6 justify-start h-full">
                
                {/* SECTION 2: PREMIUM RETRO MUSIC PLAYER (Ali Gatie - It's You - Slightly Smaller) */}
                <section className="w-full scrapbook-paper p-4 relative hover:translate-y-[-4px] transition-transform duration-300 overflow-hidden flex flex-col justify-between group min-h-[380px]">
                  {/* Visual Tapes at the margins */}
                  <div className="absolute top-[-10px] right-8 w-14 h-5 bg-pink-100/10 backdrop-blur-sm border-x border-dashed border-white/20 rotate-[3deg] pointer-events-none z-10" />
                  
                  {/* Floating music notes container */}
                  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    <AnimatePresence>
                      {floatingNotes.map(note => (
                        <motion.div
                          key={note.id}
                          initial={{ y: 40, x: 0, opacity: 0, scale: 0.8 }}
                          animate={{ 
                            y: -180, 
                            x: Math.sin(note.id) * 20,
                            opacity: [0, 1, 1, 0],
                            scale: [0.8, 1.1, 1, 0.8]
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 3.2, ease: 'easeOut' }}
                          className="absolute text-pink-300 font-bold select-none text-lg"
                          style={{ left: `${note.left}%`, bottom: '15%' }}
                        >
                          {note.icon}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Header inside player */}
                  <div className="flex items-center justify-between w-full relative z-20">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg animate-pulse">🎵</span>
                      <span className="text-[9px] tracking-widest uppercase text-pink-200/50 font-bold font-primary">Now Playing</span>
                    </div>
                    
                    {/* Cute Liked Heart Button */}
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-1 text-pink-300/80 hover:text-pink-400 transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'fill-pink-400 text-pink-400 heart-pop' : 'text-pink-300/60 hover:text-pink-300'}`} 
                      />
                    </motion.button>
                  </div>

                  {/* Centered Vinyl Disc & Tonearm (Slightly Smaller & Compact) */}
                  <div className="relative w-full flex-grow flex items-center justify-center my-2 py-1">
                    <div className="relative w-32 h-32 flex items-center justify-center bg-zinc-950/30 rounded-full p-1.5 border border-white/5 shadow-inner">
                      {/* Tonearm */}
                      <div 
                        className="absolute top-[-5px] right-2 w-10 h-16 origin-top-right transition-transform duration-700 ease-out z-20 pointer-events-none"
                        style={{
                          transform: isPlaying ? 'rotate(13deg)' : 'rotate(-15deg)',
                        }}
                      >
                        <svg viewBox="0 0 50 100" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          <path d="M45,10 L25,10 L20,70 L25,85" fill="none" stroke="#d4d4d8" strokeWidth="3" strokeLinecap="round"/>
                          <circle cx="45" cy="10" r="5" fill="#780d19" />
                          <rect x="20" y="80" width="10" height="15" rx="2" fill="#3f3f46" />
                        </svg>
                      </div>

                      {/* Vinyl Disc */}
                      <div 
                        className={`w-28 h-28 rounded-full bg-black border-4 border-zinc-800 relative flex items-center justify-center select-none shadow-[0_8px_20px_rgba(0,0,0,0.8)] ${isPlaying ? 'spin-slow' : ''}`}
                        style={{
                          backgroundImage: 'radial-gradient(circle, #27272a 1px, transparent 1px), radial-gradient(circle, #000 70%, #27272a 72%, #18181b 74%, #000 76%)',
                          backgroundSize: '100% 100%, 100% 100%',
                          animationPlayState: isPlaying ? 'running' : 'paused'
                        }}
                      >
                        {/* Concentric Groove Rings */}
                        <div className="absolute inset-3 rounded-full border border-zinc-700/10" />
                        <div className="absolute inset-6 rounded-full border border-zinc-700/15" />
                        <div className="absolute inset-9 rounded-full border border-zinc-700/10" />
                        <div className="absolute inset-12 rounded-full border border-zinc-700/15" />

                        {/* Sticker Label */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#780d19] to-[#fbc6cb] flex items-center justify-center shadow-inner relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1b0204]" />
                          <span className="absolute text-[5px] text-white font-extrabold bottom-1 tracking-wider uppercase">IT'S YOU</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Song Details & Scrubber & Controls at bottom */}
                  <div className="w-full relative z-20 flex flex-col gap-2">
                    {/* Song Details */}
                    <div className="text-center">
                      <h3 className="font-fancy text-lg font-bold text-white tracking-wide leading-tight">It's You</h3>
                      <p className="font-handwritten text-[#fbc6cb] text-sm leading-tight">Ali Gatie</p>
                    </div>

                    {/* Custom Seekable Progress Bar */}
                    <div className="w-full flex flex-col gap-0.5 font-primary">
                      <div 
                        onClick={handleSeek}
                        className="w-full h-1 bg-pink-950/40 rounded-full cursor-pointer overflow-hidden relative border border-white/5 hover:h-1.5 transition-all"
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-[#ab1627] to-[#fbc6cb] rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-pink-200/60 font-semibold px-0.5">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Buttons and controls */}
                    <div className="flex items-center justify-center gap-3 pt-0.5">
                      {/* Previous/Restart button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevSong}
                        className="p-1.5 text-pink-200 hover:text-white bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-all"
                        title="Restart song"
                      >
                        <SkipBack className="w-3.5 h-3.5 fill-current" />
                      </motion.button>

                      {/* Main Play/Pause */}
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={togglePlay}
                        className="p-2.5 bg-gradient-to-tr from-[#780d19] to-[#ab1627] text-white rounded-full shadow-md border border-pink-200/20 hover:from-[#ab1627] hover:to-[#ff3b5c] transition-all"
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-white" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-white translate-x-[1px]" />
                        )}
                      </motion.button>

                      {/* Next song repeat notice button */}
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleNextSong}
                          className="p-1.5 text-pink-200 hover:text-white bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-all"
                        >
                          <SkipForward className="w-3.5 h-3.5 fill-current" />
                        </motion.button>
                        
                        {/* Repeat tooltip notification */}
                        <AnimatePresence>
                          {showRepeatMessage && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: -45, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute left-1/2 -translate-x-1/2 bg-[#780d19] border border-pink-300/25 py-1 px-2.5 text-pink-100 text-[10px] rounded shadow-2xl whitespace-nowrap z-30 font-primary"
                            >
                              Playing on repeat! 🔁💖
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Volume Mute */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className="p-1.5 text-pink-200 hover:text-white bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-all"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </motion.button>
                    </div>
                  </div>
                </section>

                {/* Upper Cats and Rose Bouquet floating sticker group (no frame!) */}
                <div className="w-full flex flex-col items-center justify-center py-2 mt-3 select-none relative z-10">
                  {/* Pulsing Love Heart sticker */}
                  <div className="text-red-500 animate-pulse text-xl select-none scale-110 mb-2">
                    ❤️
                  </div>

                  {/* Leaning Cats floating directly on starry backdrop (Extremely Large & Clickable!) */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); triggerKisses(); }}
                    className="flex gap-3 items-end relative cursor-pointer pointer-events-auto active:scale-95 transition-transform"
                    title="Click cats for kisses! 💋"
                  >
                    {/* Leaning Black Cat */}
                    <motion.div 
                      whileHover={{ scale: 1.12 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex flex-col items-center origin-bottom rotate-[6deg] -mr-4"
                    >
                      <svg viewBox="0 0 100 120" className="w-28 h-32 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]">
                        <path d="M50 20 C65 20 75 35 75 55 C75 75 70 95 70 95 L30 95 C30 95 25 75 25 55 C25 35 35 20 50 20 Z" fill="#170204"/>
                        <polygon points="25,40 15,10 38,30" fill="#170204"/>
                        <polygon points="75,40 85,10 62,30" fill="#170204"/>
                        <ellipse cx="40" cy="50" rx="6" ry="10" fill="#ffeb3b"/>
                        <ellipse cx="60" cy="50" rx="6" ry="10" fill="#ffeb3b"/>
                        <ellipse cx="40" cy="50" rx="2" ry="8" fill="#000"/>
                        <ellipse cx="60" cy="50" rx="2" ry="8" fill="#000"/>
                        <polygon points="48,60 52,60 50,63" fill="#f8bbd0"/>
                        <line x1="20" y1="62" x2="5" y2="60" stroke="#fbc6cb" strokeWidth="1.5"/>
                        <line x1="20" y1="68" x2="3" y2="70" stroke="#fbc6cb" strokeWidth="1.5"/>
                        <line x1="80" y1="62" x2="95" y2="60" stroke="#fbc6cb" strokeWidth="1.5"/>
                        <line x1="80" y1="68" x2="97" y2="70" stroke="#fbc6cb" strokeWidth="1.5"/>
                      </svg>
                    </motion.div>

                    {/* Leaning Pink/White Cat */}
                    <motion.div 
                      whileHover={{ scale: 1.12 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                      className="flex flex-col items-center origin-bottom rotate-[-6deg]"
                    >
                      <svg viewBox="0 0 100 120" className="w-28 h-32 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]">
                        <path d="M50 20 C65 20 75 35 75 55 C75 75 70 95 70 95 L30 95 C30 95 25 75 25 55 C25 35 35 20 50 20 Z" fill="#fbc6cb"/>
                        <polygon points="25,40 15,10 38,30" fill="#fbc6cb"/>
                        <polygon points="75,40 85,10 62,30" fill="#fbc6cb"/>
                        <ellipse cx="40" cy="50" rx="5" ry="5" fill="#424242"/>
                        <ellipse cx="60" cy="50" rx="5" ry="5" fill="#424242"/>
                        <circle cx="34" cy="58" r="5" fill="#f06292" opacity="0.6"/>
                        <circle cx="66" cy="58" r="5" fill="#f06292" opacity="0.6"/>
                        <polygon points="48,60 52,60 50,63" fill="#e91e63"/>
                        <line x1="20" y1="62" x2="5" y2="60" stroke="#780d19" strokeWidth="1.5"/>
                        <line x1="20" y1="68" x2="3" y2="70" stroke="#780d19" strokeWidth="1.5"/>
                        <line x1="80" y1="62" x2="95" y2="60" stroke="#780d19" strokeWidth="1.5"/>
                        <line x1="80" y1="68" x2="97" y2="70" stroke="#780d19" strokeWidth="1.5"/>
                      </svg>
                    </motion.div>
                  </div>

                  {/* Physical 4cm distance spacing between cats and rose bouquet */}
                  <div className="h-20" />

                  {/* Gorgeous vintage rose bouquet die-cut sticker (Extremely Large & Clickable!) */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -3 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    onClick={(e) => { e.stopPropagation(); triggerRoses(); }}
                    className="w-56 h-56 relative cursor-pointer filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] group/bouquet pointer-events-auto"
                    title="Click bouquet for flying roses! 🌹"
                  >
                    <img 
                      src="rose_bouquet.png" 
                      alt="Vintage Rose Bouquet Sticker" 
                      className="w-full h-full object-contain rotate-[-4deg]"
                    />
                    {/* Tiny floating decorative hearts/flowers above bouquet */}
                    <span className="absolute top-[-5px] right-2 text-pink-300 text-sm animate-bounce">🌸</span>
                    <span className="absolute top-[-10px] left-3 text-red-400 text-xs animate-pulse">💖</span>
                  </motion.div>

                  <span className="font-handwritten text-pink-200/90 text-lg mt-2 tracking-wide select-none">
                    Cats: Kisses 💋 | Bouquet: Roses 🌹
                  </span>
                </div>

              </div>

              {/* SECTION 3: POLAROIDS COLLAGE */}
              <section className="col-span-1 md:col-span-8 scrapbook-paper p-6 relative overflow-hidden">
                {/* Visual Tapes at the margins */}
                <div className="absolute top-[-12px] left-1/3 w-20 h-6 bg-pink-100/10 border-x border-dashed border-white/20 rotate-[-2deg] z-10" />

                {/* Local sparkling stars for Polaroid section background */}
                <div className="absolute inset-0 pointer-events-none opacity-25 z-0 overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="star-blink absolute text-pink-200 select-none text-lg"
                      style={{
                        left: `${Math.random() * 90 + 5}%`,
                        top: `${Math.random() * 90 + 5}%`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    >
                      ★
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="text-xl">✨</span>
                  <h3 className="font-fancy text-lg font-bold text-white tracking-wide">Scratch to Reveal Memories</h3>
                </div>

                {/* Layered Polaroid composition */}
                <div className="flex flex-wrap justify-center gap-6 py-4">
                  <div className="relative">
                    <div className="polaroid-tape" />
                    <ScratchCard 
                      imageSrc={IMAGES.couple1} 
                      caption="Scratch me! 🤫" 
                      rotation="-3deg" 
                    />
                  </div>

                  <div className="relative">
                    <div className="polaroid-tape" />
                    <ScratchCard 
                      imageSrc={IMAGES.couple2} 
                      caption="Our Laughs 💖" 
                      rotation="2deg" 
                    />
                  </div>

                  <div className="relative">
                    <div className="polaroid-tape" />
                    <ScratchCard 
                      imageSrc={IMAGES.couple3} 
                      caption="Forever Us ✨" 
                      rotation="-2deg" 
                    />
                  </div>
                </div>

                {/* Wax Seal Sign-off Signature */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <div className="w-12 h-12 rounded-full bg-[#780d19] border-2 border-dashed border-[#1b0204] flex items-center justify-center text-pink-100 text-lg shadow-md font-bold rotate-12">
                    ❤
                  </div>
                  <div className="font-handwritten text-[#fbc6cb] text-xl leading-snug">
                    <p>From: <span className="font-bold">Raghod</span></p>
                    <p>For: <span className="font-bold">Tawfik</span></p>
                  </div>
                </div>
              </section>

              {/* SECTION 4: HEARTFELT MESSAGE CARD (Interactive Vintage Red Envelope) */}
              <section 
                onClick={() => setIsLetterOpen(!isLetterOpen)}
                className="col-span-1 md:col-span-4 scrapbook-paper p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:translate-y-[-4px] transition-transform duration-300 relative overflow-hidden min-h-[350px]"
              >
                <AnimatePresence mode="wait">
                  {!isLetterOpen ? (
                    <motion.div
                      key="envelope-closed"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-between w-full h-full py-4 select-none relative z-20"
                    >
                      {/* Stamp decoration */}
                      <div className="absolute top-4 right-4 w-10 h-12 bg-pink-100/10 border border-dashed border-white/20 rounded flex items-center justify-center text-xs rotate-6">
                        📬
                      </div>
                      
                      {/* Envelope Flap mock */}
                      <div className="w-full border-t-[3px] border-dashed border-pink-200/20 my-4" />
                      
                      {/* Label on envelope */}
                      <div className="font-handwritten text-2xl text-pink-200 mt-2 mb-6">
                        For my favorite person... 💌
                      </div>

                      {/* Golden Wax Seal */}
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f3e5ab] border-2 border-[#b8860b] flex items-center justify-center text-2xl shadow-xl rotate-12 relative z-10"
                      >
                        ❤
                      </motion.div>

                      {/* Envelope Flap mock bottom */}
                      <div className="w-full border-b-[3px] border-dashed border-pink-200/20 my-6" />

                      {/* Tap to open label */}
                      <div className="font-primary font-light tracking-widest text-[11px] uppercase text-pink-300/60 animate-pulse mt-2">
                        tap to open
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="envelope-opened"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full bg-[#fcf9f2] text-[#59050c] p-6 rounded-lg border-2 border-dashed border-[#8a1420]/30 shadow-2xl relative flex flex-col justify-between min-h-[300px]"
                    >
                      {/* Cute ribbon top */}
                      <div className="text-center text-xl mb-1 select-none">🎀</div>
                      
                      <div className="font-fancy text-5xl text-[#8a1420]/20 leading-none mb-1 text-center">“</div>
                      
                      <blockquote className="font-fancy italic text-[#59050c] text-sm md:text-base leading-relaxed mb-4 text-center font-semibold">
                        Sometimes I catch myself smiling at my phone just because of you 🥹❤️ You make ordinary days feel softer and happier, and honestly, having you in my life is one of my favorite things.
                      </blockquote>
                      
                      <div className="text-center font-handwritten text-lg text-[#8a1420] mt-1 font-bold">
                        Forever Yours 🌹
                      </div>
                      
                      {/* Close prompt */}
                      <div className="font-primary text-[10px] tracking-widest uppercase text-[#8a1420]/50 mt-4 text-center animate-pulse">
                        tap to fold back
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* SECTION 5: WINDOWED RETRO MAP */}
              <section className="col-span-1 md:col-span-7 scrapbook-paper overflow-hidden flex flex-col h-96 hover:translate-y-[-4px] transition-transform duration-300">
                {/* Chrome Header style window bar */}
                <div className="bg-[#2a0408] border-b border-pink-200/10 py-3 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] tracking-widest text-pink-200/50 uppercase font-bold">Memory map</span>
                  <div className="flex gap-1.5 font-primary">
                    <button onClick={() => handleZoom(-0.1)} className="px-2 py-0.5 text-pink-200 hover:text-white text-xs bg-pink-100/5 rounded hover:bg-pink-100/10 border border-white/5">-</button>
                    <button onClick={() => handleZoom(0.1)} className="px-2 py-0.5 text-pink-200 hover:text-white text-xs bg-pink-100/5 rounded hover:bg-pink-100/10 border border-white/5">+</button>
                  </div>
                </div>

                {/* Map Viewport Area */}
                <div ref={viewportRef} className="relative flex-grow overflow-hidden select-none bg-[#170204]">
                  <div className="absolute top-2 left-2 z-10 text-[9px] bg-black/75 py-1 px-2 border border-white/10 text-pink-200/80 rounded font-primary">
                    Drag/scroll map to explore 🗺
                  </div>

                  <div 
                    ref={mapRef}
                    onMouseDown={handleMapMouseDown}
                    onMouseMove={handleMapMouseMove}
                    onMouseUp={handleMapMouseUp}
                    onMouseLeave={handleMapMouseUp}
                    onTouchStart={handleMapMouseDown}
                    onTouchMove={handleMapMouseMove}
                    onTouchEnd={handleMapMouseUp}
                    className="absolute w-[1200px] h-[1200px] origin-top-left cursor-grab active:grabbing"
                    style={{
                      transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapScale})`,
                      transition: isDraggingMap ? 'none' : 'transform 0.1s ease-out'
                    }}
                  >
                    {/* Retro Grid Map background */}
                    <div 
                      className="absolute inset-0 opacity-15"
                      style={{
                        backgroundImage: 'radial-gradient(#780d19 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />

                    {/* Cute Compass sticker to enrich the vintage map theme */}
                    <div className="absolute bottom-24 right-24 opacity-25 select-none pointer-events-none w-24 h-24 flex items-center justify-center border-4 border-dashed border-[#780d19] rounded-full text-pink-300 font-bold text-xs uppercase font-primary tracking-widest rotate-[15deg]">
                      <div className="text-center">
                        <span className="text-xl">🧭</span>
                        <div className="mt-1 text-[8px] font-extrabold">Love Route</div>
                      </div>
                    </div>

                    {/* Marker 1: Peace University (Single Focused Memory) */}
                    <div 
                      onClick={() => setSelectedMarkerPhoto('salam_uni.jpg')}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedMarkerPhoto('salam_uni.jpg');
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="absolute group cursor-pointer flex items-center justify-center" 
                      style={{ top: '30%', left: '40%' }}
                    >
                      {/* Pulse glow circles under the pin */}
                      <span className="absolute w-12 h-12 bg-pink-500/35 rounded-full animate-ping pointer-events-none" />
                      <span className="absolute w-6 h-6 bg-red-600/40 rounded-full blur-[2px] pointer-events-none" />
                      
                      <span className="text-4xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)] inline-block animate-bounce relative z-10">📍</span>
                      
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 bg-[#2a0408] border border-pink-200/15 p-3 rounded-lg shadow-2xl text-center pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                        <h4 className="text-xs font-bold text-white font-fancy">جامعة السلام 🎓</h4>
                        <p className="text-[10px] text-pink-200/70 mt-1 font-primary leading-relaxed font-semibold">طريق طنطا، شمال الدلتا 🇪🇬✨ (اضغط لرؤية صورتنا! 📸)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 6: CUTE CATS (No frame - floating on starry background) */}
              <section className="col-span-1 md:col-span-5 p-6 flex flex-col justify-center items-center h-96 relative overflow-hidden transition-transform duration-300">
                {/* Local sparkling stars directly behind the cats */}
                <div className="absolute inset-0 pointer-events-none opacity-30 z-0 overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="star-blink absolute text-pink-200 select-none text-xl"
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    >
                      ★
                    </div>
                  ))}
                </div>
                
                <h3 className="font-handwritten text-4xl text-pink-100 mb-4 tracking-wide drop-shadow-[0_0_10px_rgba(120,13,25,0.7)] animate-pulse">
                  i love you
                </h3>

                <div 
                  onClick={triggerKisses}
                  className="flex gap-6 items-end mt-2 z-10 cursor-pointer group/bottomcats"
                >
                  {/* Black Cat */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center"
                  >
                    <svg viewBox="0 0 100 120" className="w-20 h-24 drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] group-hover/bottomcats:scale-105 transition-transform">
                      <path d="M50 20 C65 20 75 35 75 55 C75 75 70 95 70 95 L30 95 C30 95 25 75 25 55 C25 35 35 20 50 20 Z" fill="#170204"/>
                      <polygon points="25,40 15,10 38,30" fill="#170204"/>
                      <polygon points="75,40 85,10 62,30" fill="#170204"/>
                      <ellipse cx="40" cy="50" rx="6" ry="10" fill="#ffeb3b"/>
                      <ellipse cx="60" cy="50" rx="6" ry="10" fill="#ffeb3b"/>
                      <ellipse cx="40" cy="50" rx="2" ry="8" fill="#000"/>
                      <ellipse cx="60" cy="50" rx="2" ry="8" fill="#000"/>
                      <polygon points="48,60 52,60 50,63" fill="#f8bbd0"/>
                      <line x1="20" y1="62" x2="5" y2="60" stroke="#fbc6cb" strokeWidth="1.5"/>
                      <line x1="20" y1="68" x2="3" y2="70" stroke="#fbc6cb" strokeWidth="1.5"/>
                      <line x1="80" y1="62" x2="95" y2="60" stroke="#fbc6cb" strokeWidth="1.5"/>
                      <line x1="80" y1="68" x2="97" y2="70" stroke="#fbc6cb" strokeWidth="1.5"/>
                    </svg>
                  </motion.div>

                  {/* White Cat */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    animate={{ y: [0, -7, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="flex flex-col items-center"
                  >
                    <svg viewBox="0 0 100 120" className="w-20 h-24 drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)] group-hover/bottomcats:scale-105 transition-transform">
                      <path d="M50 20 C65 20 75 35 75 55 C75 75 70 95 70 95 L30 95 C30 95 25 75 25 55 C25 35 35 20 50 20 Z" fill="#fbc6cb"/>
                      <polygon points="25,40 15,10 38,30" fill="#fbc6cb"/>
                      <polygon points="75,40 85,10 62,30" fill="#fbc6cb"/>
                      <ellipse cx="40" cy="50" rx="5" ry="5" fill="#424242"/>
                      <ellipse cx="60" cy="50" rx="5" ry="5" fill="#424242"/>
                      <circle cx="34" cy="58" r="5" fill="#f06292" opacity="0.6"/>
                      <circle cx="66" cy="58" r="5" fill="#f06292" opacity="0.6"/>
                      <polygon points="48,60 52,60 50,63" fill="#e91e63"/>
                      <line x1="20" y1="62" x2="5" y2="60" stroke="#780d19" strokeWidth="1.5"/>
                      <line x1="20" y1="68" x2="3" y2="70" stroke="#780d19" strokeWidth="1.5"/>
                      <line x1="80" y1="62" x2="95" y2="60" stroke="#780d19" strokeWidth="1.5"/>
                      <line x1="80" y1="68" x2="97" y2="70" stroke="#780d19" strokeWidth="1.5"/>
                    </svg>
                  </motion.div>
                </div>


              </section>

            </div>
          </motion.main>
        )}

      </AnimatePresence>

      {/* Polaroid memory photo modal overlay */}
      <AnimatePresence>
        {selectedMarkerPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMarkerPhoto(null)}
            className="fixed inset-0 bg-[#1b0204]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, rotate: -4 }}
              animate={{ scale: 1, rotate: 1 }}
              exit={{ scale: 0.9, rotate: -4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white p-4 pb-12 rounded shadow-2xl max-w-sm w-full border border-pink-200/20"
            >
              {/* Polaroid Tape simulation */}
              <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-28 h-6 bg-pink-100/35 border-x border-dashed border-white/20 rotate-1 shadow-sm" />
              
              {/* Main Photo */}
              <div className="w-full aspect-[4/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-200/50 shadow-inner">
                <img 
                  src={selectedMarkerPhoto} 
                  alt="Salam University Memory" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    // Fallback high-quality university building background
                    e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=cover';
                  }}
                />
              </div>
              
              {/* Handwritten Caption */}
              <div className="font-handwritten text-[#780d19] text-center text-3xl mt-6 tracking-wide font-bold">
                جامعة السلام 🎓✨
              </div>
              
              {/* Cute Close icon */}
              <button 
                onClick={() => setSelectedMarkerPhoto(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-[#780d19] hover:bg-[#ab1627] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen flying kisses burst overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {kisses.map(kiss => (
            <motion.div
              key={kiss.id}
              initial={{ y: '105vh', x: `${kiss.x}vw`, scale: 0, opacity: 0, rotate: kiss.rotation }}
              animate={{ 
                y: '-15vh', 
                x: `${kiss.x + Math.sin(kiss.id) * 18}vw`, // swaying path
                scale: kiss.scale,
                opacity: [0, 1, 1, 0],
                rotate: kiss.rotation + (Math.random() > 0.5 ? 45 : -45)
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: kiss.duration,
                delay: kiss.delay,
                ease: [0.25, 0.1, 0.25, 1.0] // smooth organic curve
              }}
              className="absolute select-none pointer-events-none"
            >
              <img 
                src="kiss_mark.svg" 
                alt="Lipstick Kiss Mark" 
                className="w-16 h-16 object-contain select-none pointer-events-none filter drop-shadow-[0_4px_10px_rgba(220,20,60,0.45)]"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Full-screen flying roses burst overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        <AnimatePresence>
          {roses.map(rose => (
            <motion.div
              key={rose.id}
              initial={{ y: '105vh', x: `${rose.x}vw`, scale: 0, opacity: 0, rotate: rose.rotation }}
              animate={{ 
                y: '-15vh', 
                x: `${rose.x + Math.sin(rose.id) * 20}vw`, // swaying path
                scale: rose.scale,
                opacity: [0, 1, 1, 0],
                rotate: rose.rotation + (Math.random() > 0.5 ? 360 : -360)
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: rose.duration,
                delay: rose.delay,
                ease: [0.25, 0.1, 0.25, 1.0] // smooth organic curve
              }}
              className="absolute text-5xl select-none filter drop-shadow-[0_4px_8px_rgba(220,38,38,0.3)]"
            >
              {rose.icon}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default App;
