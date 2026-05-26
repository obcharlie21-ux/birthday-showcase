import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScratchCard = ({ imageSrc, caption, rotation }) => {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear and draw metallic burgundy cover layer
    ctx.fillStyle = '#961c28';
    ctx.fillRect(0, 0, width, height);

    // Decorative texture dots on scratch coating
    ctx.fillStyle = 'rgba(249, 211, 215, 0.25)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 8 + 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Centered label text instruction
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch Me! 🤫', width / 2, height / 2);
  }, []);

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Scale coordinates correctly in case the canvas styling is responsive
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const scratch = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(canvas, e);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 32;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Check scratch percentage to automatically complete
    checkScratchPercentage(canvas);
  };

  const checkScratchPercentage = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const pct = (transparentCount / (pixels.length / 4)) * 100;
    if (pct > 65 && !isScratched) {
      setIsScratched(true);
      // Fade out completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <motion.div
      style={{ rotate: rotation }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      className="bg-white p-3 pb-6 rounded shadow-lg flex flex-col items-center border border-pink-200/10 cursor-grab active:cursor-grabbing w-full max-w-[220px]"
    >
      <div className="relative w-48 h-48 bg-pink-100 overflow-hidden rounded border border-gray-200/50">
        
        {/* Placeholder / Uploaded Image */}
        <img
          src={imageSrc}
          alt={caption}
          className="w-full h-full object-cover select-none"
        />

        {/* Scratch-off Canvas Cover */}
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseMove={scratch}
          onTouchStart={() => setIsDrawing(true)}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={scratch}
          className="absolute inset-0 z-10 transition-opacity duration-500 w-full h-full"
          style={{ opacity: isScratched ? 0 : 1, pointerEvents: isScratched ? 'none' : 'auto' }}
        />

      </div>

      <div className="font-handwritten text-[#3e0d12] text-xl font-semibold mt-3 text-center w-full">
        {caption}
      </div>
    </motion.div>
  );
};

export default ScratchCard;
