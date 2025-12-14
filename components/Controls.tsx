import React from 'react';
import { 
  Play, 
  ChevronLeft, 
  MonitorOff, 
  Eraser, 
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
    <div className="flex items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-[var(--shadow-soft)]">
      
      {/* Navigation */}
      <div className="flex items-center">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            !canPrev ? 'text-zinc-700' : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title="Prev"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onNext}
          disabled={!canNext}
          className={`w-12 h-12 flex items-center justify-center rounded-full mx-1 transition-all shadow-lg ${
            !canNext 
            ? 'bg-zinc-800 text-zinc-600' 
            : 'bg-white text-black hover:scale-105 hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white/50'
          }`}
          title="Next"
        >
          <Play size={20} fill="currentColor" className="ml-1" />
        </button>

        <button
           onClick={onNext}
           disabled={!canNext}
           className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all sm:hidden"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            isClear 
              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
              : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/5'
          }`}
        >
          Clear
        </button>

        <button
          onClick={onBlackout}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            isBlackout 
              ? 'bg-zinc-700 text-white' 
              : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/5'
          }`}
        >
          Blank
        </button>

        <button
          onClick={onOffering}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            isOffering 
              ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
              : 'text-zinc-300 hover:text-zinc-100 hover:bg-white/5'
          }`}
          title="Toggle Offering"
        >
          <QrCode size={18} />
        </button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-2" />

      {/* View Controls */}
      <div>
        <button
          onClick={onFullscreen}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
            isFullscreen ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Controls;
