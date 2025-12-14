import React from 'react';
import { SlideTheme, OfferingConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideDisplayProps {
  content: string;
  theme: SlideTheme;
  isBlackout: boolean;
  isClear: boolean;
  isOffering?: boolean;
  offeringConfig?: OfferingConfig;
  isPreview?: boolean;
}

const SlideDisplay: React.FC<SlideDisplayProps> = ({
  content,
  theme,
  isBlackout,
  isClear,
  isOffering = false,
  offeringConfig,
  isPreview = false
}) => {
  const containerStyle: React.CSSProperties = {
    background: theme.type === 'image' ? `url(${theme.value}) center/cover no-repeat` : theme.value,
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontFamily: theme.fontFamily,
    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
    textAlign: 'center',
  };

  if (isBlackout) {
    return (
      <div className="w-full h-full bg-black transition-colors duration-500 ease-in-out">
         {/* Blank */}
      </div>
    );
  }

  // Calculate font size but cap it for safety
  const rawSize = 5 * (theme.fontSize || 1);
  const fontSizeStyle = isPreview ? '1rem' : `${Math.min(rawSize, 12)}vw`;

  return (
    <div style={containerStyle} className="transition-all duration-700 ease-in-out">
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: theme.overlayOpacity }}
      />

      {/* OFFERING OVERLAY - MODERN CARD STYLE */}
      <AnimatePresence>
        {isOffering && offeringConfig && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-30 flex items-center justify-center p-8"
          >
            <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-16 md:p-20 max-w-5xl w-full shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Background Glow */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

              <h1 className="text-5xl md:text-7xl font-extrabold mb-12 text-white font-display tracking-tight leading-none">
                {offeringConfig.title}
              </h1>
              
              {offeringConfig.qrImageUrl && (
                <div className="relative p-6 bg-white rounded-3xl shadow-2xl mb-12 group transition-transform hover:scale-105 duration-500">
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity" />
                  <img 
                    src={offeringConfig.qrImageUrl} 
                    alt="Scan to Give" 
                    className="w-56 h-56 md:w-72 md:h-72 object-contain"
                  />
                  
                  {/* Scan Corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-black rounded-tl-lg opacity-20" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-black rounded-tr-lg opacity-20" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-black rounded-bl-lg opacity-20" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-black rounded-br-lg opacity-20" />
                </div>
              )}

              <p className="text-2xl md:text-4xl text-zinc-400 font-display font-medium tracking-tight">
                {offeringConfig.subTitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDE CONTENT */}
      <AnimatePresence mode="wait">
        {!isClear && !isOffering && content && (
          <motion.div
            key={content}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 w-full px-12 md:px-20 max-w-6xl mx-auto"
          >
            <p 
              className="whitespace-pre-wrap leading-tight md:leading-[0.98] tracking-tight font-extrabold font-display drop-shadow-xl"
              style={{ fontSize: fontSizeStyle }}
            >
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideDisplay;
