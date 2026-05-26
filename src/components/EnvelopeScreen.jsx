import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EnvelopeScreen = ({ onOpenDashboard }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-[#23080c] to-[#3e0d12]">
      
      {/* Decorative Falling Rose Petals Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0 }}
            animate={{
              y: window.innerHeight + 50,
              x: `calc(${Math.random() * window.innerWidth}px + 50px)`,
              rotate: 360,
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute w-6 h-6 bg-rose-700/80 rounded-br-2xl rounded-tl-2xl"
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-lg px-4">
        
        {/* Scrapbook Envelope Container */}
        <div 
          className="relative w-80 h-56 cursor-pointer group mt-12"
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {/* Back pocket of the envelope */}
          <div className="absolute inset-0 bg-[#5e141b] rounded-b-2xl shadow-2xl z-10 border-b-2 border-pink-200/10" />

          {/* Envelope Flap (Folds open upwards) */}
          <motion.div
            initial={false}
            animate={{ rotateX: isOpen ? 180 : 0, zIndex: isOpen ? 5 : 20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ originY: '0%', transformStyle: 'preserve-3d' }}
            className="absolute top-0 inset-x-0 h-28 bg-[#961c28] rounded-t-2xl shadow-md border-t border-pink-200/20"
          >
            {/* Inner flap visual styling */}
            <div className="absolute inset-0 bg-[#961c28] rounded-t-2xl flex items-center justify-center backface-hidden">
              <span className="text-pink-100 text-3xl opacity-80 filter drop-shadow">💌</span>
            </div>
            <div className="absolute inset-0 bg-[#5e141b] rounded-t-2xl rotate-x-180 backface-hidden border-b border-pink-200/20" />
          </motion.div>

          {/* Inside letter card */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { y: -130, scale: 1.12, zIndex: 15 }
                : { y: 0, scale: 1, zIndex: 8 }
            }
            transition={{ duration: 0.6, delay: isOpen ? 0.3 : 0, ease: 'easeOut' }}
            className="absolute inset-x-4 top-4 bg-amber-50 border border-amber-100 p-6 rounded-xl shadow-lg flex flex-col justify-between"
            style={{ height: isOpen ? '280px' : '180px' }}
          >
            <div className="text-center font-primary text-[#3e0d12]">
              <h3 className="font-handwritten text-3xl font-bold text-[#c5293d] mb-3">Happy Birthday! 🎂</h3>
              <p className="text-xs leading-relaxed font-fancy italic">
                To my absolute favorite human, the one who brings light and warmth to my life every single day.
              </p>
              <p className="text-xs leading-relaxed font-primary mt-2">
                Today is all about you. I wanted to build this special scrapbook corner of the internet just for us, to capture our beautiful memories.
              </p>
              <p className="font-handwritten text-xl text-[#c5293d] mt-2 font-bold">- Yours Always ❤️</p>
            </div>

            {isOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDashboard();
                }}
                className="w-full py-2 bg-[#961c28] text-pink-100 font-primary text-xs font-semibold rounded-full hover:bg-[#c5293d] transition-colors duration-200 mt-2 shadow"
              >
                Enter Our Scrapbook ✨
              </motion.button>
            )}
          </motion.div>

          {/* Side flaps visual depth pocket wrapper */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-[#3e0d12] to-transparent pointer-events-none rounded-b-2xl z-12 opacity-80" 
            style={{ clipPath: 'polygon(0% 100%, 50% 50%, 100% 100%)' }}
          />
        </div>

        {/* Envelope Hint */}
        <AnimatePresence>
          {!isOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3], transition: { repeat: Infinity, duration: 2 } }}
              exit={{ opacity: 0 }}
              className="text-pink-200/80 font-fancy italic mt-8 text-lg"
            >
              Click the envelope to open 💌
            </motion.p>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default EnvelopeScreen;
