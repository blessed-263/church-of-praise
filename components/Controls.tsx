import React from 'react';
import {
  Play,
  ChevronLeft,
  Maximize,
  Minimize,
  QrCode,
  ChevronRight
} from 'lucide-react';

interface ControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onBlackout: () => void;
  onClear: () => void;
  onOffering: () => void;
  onFullscreen: () => void;
  isBlackout: boolean;
  isClear: boolean;
  isOffering: boolean;
  isFullscreen: boolean;
  canNext: boolean;
  canPrev: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onNext,
  onPrev,
  onBlackout,
  onClear,
  onOffering,
  onFullscreen,
  isBlackout,
  isClear,
  isOffering,
  isFullscreen,
  canNext,
  canPrev
}) => {
  return (
    <div className="flex items-center gap-1 p-2 bg-white/90 border border-stone-200 rounded-full shadow-[0_10px_30px_rgba(62,48,38,0.08)]">
      <div className="flex items-center">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            !canPrev ? 'text-stone-300' : 'text-stone-600 hover:bg-stone-100'
          }`}
          title="Prev"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={onNext}
          disabled={!canNext}
          className={`w-11 h-11 flex items-center justify-center rounded-full mx-0.5 ${
            !canNext
            ? 'bg-stone-100 text-stone-400'
            : 'bg-[#4f7a68] text-white hover:bg-[#406557]'
          }`}
          title="Next"
        >
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </button>

        <button
           onClick={onNext}
           disabled={!canNext}
           className="w-10 h-10 flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 sm:hidden"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          className={`px-3.5 py-2 rounded-full text-xs font-medium ${
            isClear
              ? 'bg-rose-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Clear
        </button>

        <button
          onClick={onBlackout}
          className={`px-3.5 py-2 rounded-full text-xs font-medium ${
            isBlackout
              ? 'bg-stone-700 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Blank
        </button>

        <button
          onClick={onOffering}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            isOffering
              ? 'bg-[#4f7a68] text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
          title="Toggle Offering"
        >
          <QrCode size={16} />
        </button>
      </div>

      <div className="w-px h-5 bg-stone-200 mx-1" />

      <div>
        <button
          onClick={onFullscreen}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            isFullscreen ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-800'
          }`}
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
    </div>
  );
};

export default Controls;
