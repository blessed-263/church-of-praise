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
    textShadow: '0 8px 28px rgba(62,48,38,0.4)',
    textAlign: 'center',
  };

  if (isBlackout) {
    return (
      <div className="w-full h-full bg-[#1a1612]">
      </div>
    );
  }

  const rawSize = 5 * (theme.fontSize || 1);
  const fontSizeStyle = isPreview ? '1rem' : `${Math.min(rawSize, 12)}vw`;

  return (
    <div style={containerStyle}>
      <div
        className="absolute inset-0"
        style={{ opacity: theme.overlayOpacity, background: '#3a2f26' }}
      />

      <AnimatePresence>
        {isOffering && offeringConfig && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 flex items-center justify-center p-6"
          >
            <div className="bg-[#fffaf4] border border-stone-200 rounded-[2rem] py-6 px-8 md:py-8 md:px-12 max-h-full max-w-3xl w-full flex flex-col items-center text-center overflow-hidden">
              <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-stone-800 font-display leading-none shrink-0">
                {offeringConfig.title}
              </h1>

              {offeringConfig.qrImageUrl && (
                <div className="p-3 bg-white border border-stone-200 rounded-2xl mb-4 min-h-0 flex items-center justify-center">
                  <img
                    src={offeringConfig.qrImageUrl}
                    alt="Scan for offering"
                    className="w-44 h-44 md:w-56 md:h-56 object-contain"
                  />
                </div>
              )}

              <p className="text-lg md:text-2xl text-stone-500 font-display shrink-0">
                {offeringConfig.subTitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isClear && !isOffering && content && (
          <motion.div
            key={content}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full px-12 md:px-20 max-w-6xl mx-auto"
          >
            <p
              className="whitespace-pre-wrap leading-tight md:leading-[1.05] font-semibold font-display"
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
