import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordScreen = ({ onCorrectPassword }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const CORRECT_PIN = '2356';

  const handleKeyPress = (value) => {
    if (value === 'delete') {
      setPin(prev => prev.slice(0, -1));
      setError(false);
    } else if (pin.length < 4) {
      const nextPin = pin + value;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        setTimeout(() => checkPin(nextPin), 300);
      }
    }
  };

  const checkPin = (currentPin) => {
    if (currentPin === CORRECT_PIN) {
      setUnlocked(true);
      setTimeout(() => {
        onCorrectPassword();
      }, 1000);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fcf9f2] overflow-hidden select-none">
      
      {/* 1. ORIGINAL WATERCOLOR BACKGROUND IMAGE (100% Sharp with NO BLUR filter at all) */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700"
        style={{ 
          backgroundImage: 'url("bg_original.jpg")',
          transform: unlocked ? 'scale(1.05)' : 'scale(1)'
        }}
      />

      {/* 2. GLOSSY BLOOM UNLOCK EFFECT ON CORRECT PASSWORD */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-rose-200/40 to-pink-100/40 mix-blend-color-dodge z-35"
          />
        )}
      </AnimatePresence>

      {/* 3. SOLID CLEAN CENTER CONTAINER OVERLAY */}
      {/* Covers the drawn padlock, key, signatures, and drawn keyboard on the background image */}
      {/* Replaces them with crisp interactive rendering */}
      <motion.div
        animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-20 flex flex-col items-center justify-center bg-[#fcf9f2]/95 border border-[#8a1420]/15 p-6 rounded-3xl shadow-xl w-[260px] h-[370px]"
      >
        
        {/* A. GLOSSY 3D HEART-SHAPED LOCK & KEY (Upper Center) */}
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-20 h-20 flex items-center justify-center cursor-pointer mb-1"
        >
          <svg 
            id="padlock" 
            viewBox="0 0 100 100" 
            className={`w-full h-full filter drop-shadow-[0_6px_10px_rgba(80,10,20,0.25)] transition-all duration-500 ${
              unlocked ? 'scale-105' : 'scale-100'
            }`}
          >
            <motion.path 
              animate={unlocked ? { rotateY: 180, x: -12, y: -6 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              d="M30 40 V28 A20 20 0 0 1 70 28 V40" 
              fill="none" 
              stroke="#59050c" 
              strokeWidth="9" 
              strokeLinecap="round"
            />
            <path 
              d="M50 35 C65 35, 78 45, 78 62 C78 78, 50 95, 50 95 C50 95, 22 78, 22 62 C22 45, 35 35, 50 35 Z" 
              fill="#8a1420"
              stroke="#4d0309"
              strokeWidth="2.5"
            />
            <path 
              d="M32 58 C32 48, 42 41, 50 41" 
              fill="none" 
              stroke="#e18d96" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              opacity="0.5"
            />
            <circle cx="50" cy="58" r="6" fill="#300205" />
            <polygon points="47.5,58 52.5,58 51.5,74 48.5,74" fill="#300205" />
          </svg>
          
          <motion.div 
            animate={{ y: [0, -3, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[16px] right-[-10px] text-xl pointer-events-none"
          >
            🔑
          </motion.div>
        </motion.div>

        {/* B. HANDWRITTEN SIGNATURE TEXT IN SCARLET - FROM RAGHOD & FOR TAWFIKK */}
        <div className="font-handwritten text-base font-bold text-[#8a1420] text-center italic leading-none mb-2">
          <p className="m-0">from : raghod</p>
          <p className="m-0 mt-0.5">for : tawfik</p>
        </div>

        {/* C. PIN dot indicators */}
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full border transition-all duration-200 ${
                i < pin.length
                  ? 'bg-[#8a1420] border-[#8a1420]'
                  : 'border-[#8a1420]/30 bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* D. INTERACTIVE COMPACT PINK KEYPAD */}
        <div className="grid grid-cols-3 gap-1 bg-[#ffffff]/60 p-2 rounded-2xl border border-[#8a1420]/15 shadow-inner w-[160px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(val.toString())}
              className="w-11 h-9 rounded-lg flex items-center justify-center font-primary text-sm font-semibold text-[#8a1420] bg-[#fbc6cb]/65 hover:bg-[#fbc6cb]/85 active:bg-rose-300 shadow-sm border border-white/60 transition-all"
            >
              {val}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKeyPress('delete')}
            className="col-start-3 w-11 h-9 rounded-lg flex items-center justify-center font-primary text-sm font-bold text-[#8a1420] bg-[#fbc6cb]/65 hover:bg-[#fbc6cb]/85 active:bg-rose-300 shadow-sm border border-white/60 transition-all"
          >
            ⌫
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleKeyPress('0')}
            className="col-start-2 w-11 h-9 rounded-lg flex items-center justify-center font-primary text-sm font-semibold text-[#8a1420] bg-[#fbc6cb]/65 hover:bg-[#fbc6cb]/85 active:bg-rose-300 shadow-sm border border-white/60 transition-all"
          >
            0
          </motion.button>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#8a1420] text-[9px] font-bold mt-2"
            >
              Wrong code. Try again!
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default PasswordScreen;
