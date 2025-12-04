import React, { useState, useEffect, useRef } from 'react';
import { Slide, AppState, SlideTheme, OfferingConfig, INITIAL_THEME, INITIAL_OFFERING, INITIAL_LYRICS } from './types';
import Editor from './components/Editor';
import SlideDisplay from './components/SlideDisplay';
import Controls from './components/Controls';
import { Layers, ExternalLink, Zap, Radio, Monitor, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'church_of_praise_youth_v2'; 

function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          slides: [], 
          isBlackout: false, 
          isClear: false,
          isOffering: false,
          theme: { ...INITIAL_THEME, ...parsed.theme },
          offeringConfig: { ...INITIAL_OFFERING, ...parsed.offeringConfig }
        };
      }
    } catch (e) {
      console.warn("Failed to load cached data:", e);
    }
    
    return {
      rawText: INITIAL_LYRICS,
      slides: [],
      currentSlideIndex: 0,
      isBlackout: false,
      isClear: false,
      isOffering: false,
      theme: INITIAL_THEME,
      offeringConfig: INITIAL_OFFERING
    };
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const livePreviewRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage for persistence AND Projector Window communication
  useEffect(() => {
    const { rawText, theme, currentSlideIndex, isBlackout, isClear, isOffering, offeringConfig, slides } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      rawText,
      theme,
      currentSlideIndex,
      isBlackout,
      isClear,
      isOffering,
      offeringConfig,
      computedSlides: slides 
    }));
  }, [state]);

  // Compute slides from text
  useEffect(() => {
    const segments = state.rawText
      .split(/\n\s*\n/) 
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newSlides: Slide[] = segments.map((content, idx) => ({
      id: `slide-${idx}`,
      content
    }));

    setState(prev => ({ 
      ...prev, 
      slides: newSlides,
      currentSlideIndex: Math.min(prev.currentSlideIndex, Math.max(0, newSlides.length - 1))
    }));
  }, [state.rawText]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'b':
        case 'B':
          toggleBlackout();
          break;
        case 'c':
        case 'C':
          toggleClear();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentSlideIndex, state.slides.length]);

  const updateText = (text: string) => {
    setState(prev => ({ ...prev, rawText: text }));
  };

  const updateTheme = (themeUpdates: Partial<SlideTheme>) => {
    setState(prev => ({ ...prev, theme: { ...prev.theme, ...themeUpdates } }));
  };

  const updateOffering = (config: Partial<OfferingConfig>) => {
    setState(prev => ({ ...prev, offeringConfig: { ...prev.offeringConfig, ...config } }));
  };

  const setSlide = (index: number) => {
    setState(prev => ({ ...prev, currentSlideIndex: index, isBlackout: false, isOffering: false }));
  };

  const nextSlide = () => {
    setState(prev => {
      // Prevent skipping offering if active, or just do nothing
      if (prev.isOffering) return prev; 
      if (prev.currentSlideIndex >= prev.slides.length - 1) return prev;
      return { ...prev, currentSlideIndex: prev.currentSlideIndex + 1 };
    });
  };

  const prevSlide = () => {
    setState(prev => {
      if (prev.isOffering) return prev;
      if (prev.currentSlideIndex <= 0) return prev;
      return { ...prev, currentSlideIndex: prev.currentSlideIndex - 1 };
    });
  };

  const toggleBlackout = () => setState(prev => ({ ...prev, isBlackout: !prev.isBlackout }));
  const toggleClear = () => setState(prev => ({ ...prev, isClear: !prev.isClear }));
  const toggleOffering = () => setState(prev => ({ ...prev, isOffering: !prev.isOffering, isBlackout: false }));

  const toggleFullscreen = () => {
    if (!livePreviewRef.current) return;
    if (!document.fullscreenElement) {
      livePreviewRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // --- Projector Window Logic ---
  const openProjectorWindow = () => {
    const width = 1280;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const win = window.open('', 'ChurchOfPraiseProjector', `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
    
    if (!win) {
      alert("Pop-up blocked! Please allow pop-ups.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Church of Praise - Output</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; overflow: hidden; background: #000; font-family: 'Outfit', sans-serif; transition: background 0.5s ease; }
          #root { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; }
          
          /* Transitions */
          .fade-enter { opacity: 0; transform: translateY(10px); }
          .fade-enter-active { opacity: 1; transform: translateY(0); transition: opacity 0.4s ease, transform 0.4s ease; }
          .fade-exit { opacity: 1; position: absolute; }
          .fade-exit-active { opacity: 0; transform: translateY(-10px); transition: opacity 0.4s ease, transform 0.4s ease; }

          .slide-content { 
             position: absolute; width: 100%; padding: 0 5vw;
             text-shadow: 0 4px 40px rgba(0,0,0,0.5); text-align: center; white-space: pre-wrap; letter-spacing: -0.02em; 
          }
          
          .offering-card { 
            background: #18181b; border-radius: 40px; padding: 4rem 6rem; text-align: center; display: flex; flex-direction: column; align-items: center; box-shadow: 0 0 80px rgba(0,0,0,0.8); 
            border: 1px solid rgba(255,255,255,0.1);
            position: absolute; z-index: 20; max-width: 80vw;
          }
          
          .bg-overlay { position: absolute; inset: 0; background: black; transition: opacity 0.5s ease; z-index: 0; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const STORAGE_KEY = '${STORAGE_KEY}';
          const root = document.getElementById('root');
          let currentContent = null;
          let currentMode = 'normal'; // 'normal', 'offering', 'blackout'
          
          function render() {
            try {
              const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
              if (!data) return;

              const { theme, isBlackout, isClear, isOffering, offeringConfig, currentSlideIndex, computedSlides } = data;
              const nextContentText = computedSlides && computedSlides[currentSlideIndex] ? computedSlides[currentSlideIndex].content : '';
              
              // 1. Handle Background
              if (theme.type === 'image') {
                document.body.style.background = 'url(' + theme.value + ') center/cover no-repeat';
              } else {
                document.body.style.background = theme.value;
              }

              // 2. Clear Root for redraw only if mode changed significantly or force update needed
              // Ideally we diff, but for simplicity we will clear and re-animate if content changes.
              
              // Handle Blackout
              if (isBlackout) {
                root.innerHTML = ''; // Clear everything
                document.body.style.backgroundColor = '#000';
                document.body.style.backgroundImage = 'none';
                currentContent = null;
                return;
              }

              // Ensure Overlay Exists
              let overlay = document.getElementById('bg-overlay');
              if (!overlay) {
                 overlay = document.createElement('div');
                 overlay.id = 'bg-overlay';
                 overlay.className = 'bg-overlay';
                 root.prepend(overlay);
              }
              overlay.style.opacity = theme.overlayOpacity;

              // Handle Offering
              if (isOffering && offeringConfig) {
                 if (currentMode !== 'offering') {
                   // Remove old slides
                   const oldSlides = document.querySelectorAll('.slide-content');
                   oldSlides.forEach(el => el.remove());

                   const container = document.createElement('div');
                   container.className = 'offering-card fade-enter';
                   // Force reflow
                   void container.offsetWidth;
                   container.classList.add('fade-enter-active');

                   const title = document.createElement('h1');
                   title.textContent = offeringConfig.title;
                   title.style.fontSize = '5vw';
                   title.style.fontWeight = '800';
                   title.style.color = 'white';
                   title.style.margin = '0 0 2rem 0';
                   title.style.lineHeight = '0.9';
                   
                   const img = document.createElement('img');
                   img.src = offeringConfig.qrImageUrl;
                   img.style.width = '18vw';
                   img.style.height = '18vw';
                   img.style.objectFit = 'contain';
                   img.style.borderRadius = '20px';
                   img.style.marginBottom = '2rem';
                   img.style.background = 'white';
                   img.style.padding = '1rem';

                   const sub = document.createElement('p');
                   sub.textContent = offeringConfig.subTitle;
                   sub.style.fontSize = '2vw';
                   sub.style.fontWeight = '400';
                   sub.style.color = '#a1a1aa';
                   sub.style.margin = '0';

                   if (offeringConfig.title) container.appendChild(title);
                   if (offeringConfig.qrImageUrl) container.appendChild(img);
                   if (offeringConfig.subTitle) container.appendChild(sub);
                   
                   root.appendChild(container);
                   currentMode = 'offering';
                 }
                 return;
              } else {
                // If we were in offering mode, remove it
                if (currentMode === 'offering') {
                   const offCard = document.querySelector('.offering-card');
                   if (offCard) offCard.remove();
                   currentMode = 'normal';
                }
              }

              // Handle Text Content
              const shouldShowText = !isClear && nextContentText;
              
              if (shouldShowText && nextContentText !== currentContent) {
                 // Exit old content
                 const oldContent = document.querySelector('.slide-content.active');
                 if (oldContent) {
                    oldContent.classList.remove('active');
                    oldContent.classList.add('fade-exit');
                    oldContent.classList.add('fade-exit-active');
                    setTimeout(() => oldContent.remove(), 400);
                 }

                 // Enter new content
                 const textContainer = document.createElement('div');
                 textContainer.className = 'slide-content active fade-enter';
                 textContainer.style.zIndex = '10';
                 textContainer.style.color = 'white';
                 textContainer.style.fontFamily = theme.fontFamily;
                 textContainer.style.fontWeight = '700';
                 textContainer.style.lineHeight = '1.1';
                 
                 const baseSize = 5 * (theme.fontSize || 1); 
                 textContainer.style.fontSize = baseSize + 'vw';
                 
                 textContainer.textContent = nextContentText;
                 root.appendChild(textContainer);
                 
                 // Trigger anim
                 requestAnimationFrame(() => {
                    textContainer.classList.add('fade-enter-active');
                 });

                 currentContent = nextContentText;
              } else if (!shouldShowText) {
                 const oldContent = document.querySelector('.slide-content.active');
                 if (oldContent) {
                    oldContent.classList.remove('active');
                    oldContent.classList.add('fade-exit');
                    oldContent.classList.add('fade-exit-active');
                    setTimeout(() => oldContent.remove(), 400);
                 }
                 currentContent = null;
              }

            } catch(e) { console.error(e); }
          }

          // Initial Render
          render();
          window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) render();
          });
        </script>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
  };

  const currentContent = state.slides[state.currentSlideIndex]?.content || "";

  return (
    <div className="flex flex-col h-screen text-white overflow-hidden bg-zinc-950 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Minimal Header */}
      <header className="h-14 flex items-center px-6 justify-between select-none z-30 shrink-0 border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Zap size={18} fill="currentColor" className="text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-lg tracking-tight leading-none text-white">Church of Praise</h1>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-none mt-1">International Youth</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={openProjectorWindow}
            className="group flex items-center gap-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium rounded-full transition-all border border-white/5"
          >
            <Monitor size={14} />
            <span>Projector</span>
          </button>
          
          {isFullscreen && (
            <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider animate-pulse shadow-lg shadow-red-500/20">
              <Radio size={12} />
              LIVE
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Editor (Left) */}
        <div className="w-[380px] shrink-0 z-20 flex flex-col bg-zinc-950 border-r border-white/5">
          <Editor 
            rawText={state.rawText} 
            onTextChange={updateText}
            onThemeChange={updateTheme}
            currentTheme={state.theme}
            offeringConfig={state.offeringConfig}
            onOfferingChange={updateOffering}
          />
        </div>

        {/* Workspace (Center) */}
        <div className="flex-1 flex flex-col relative bg-zinc-900/50">
          
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 lg:p-16 overflow-hidden relative">
            
            {/* Slide Container */}
            <div 
              ref={livePreviewRef} 
              className={`relative bg-black overflow-hidden transition-all duration-300 ease-out ${
                isFullscreen 
                  ? 'w-full h-full fixed inset-0 z-50' 
                  : 'aspect-video w-full max-w-5xl shadow-2xl rounded-2xl ring-1 ring-white/5'
              }`}
            >
              <SlideDisplay 
                content={currentContent}
                theme={state.theme}
                isBlackout={state.isBlackout}
                isClear={state.isClear}
                isOffering={state.isOffering}
                offeringConfig={state.offeringConfig}
              />
              
              {!isFullscreen && (
                 <div className="absolute top-4 right-4 pointer-events-none z-50">
                    <div className="bg-zinc-900/80 backdrop-blur text-white/40 text-[9px] font-bold px-3 py-1 rounded-full border border-white/5">PREVIEW</div>
                 </div>
              )}
            </div>
          </div>

          {/* Floating Controls (Bottom Center) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
            <Controls 
              onNext={nextSlide}
              onPrev={prevSlide}
              onBlackout={toggleBlackout}
              onClear={toggleClear}
              onOffering={toggleOffering}
              onFullscreen={toggleFullscreen}
              isBlackout={state.isBlackout}
              isClear={state.isClear}
              isOffering={state.isOffering}
              isFullscreen={isFullscreen}
              canNext={state.currentSlideIndex < state.slides.length - 1}
              canPrev={state.currentSlideIndex > 0}
            />
          </div>
        </div>

        {/* Slide List (Right) */}
        <div className="w-64 bg-zinc-950 border-l border-white/5 flex flex-col shrink-0 z-10">
          <div className="h-12 flex items-center gap-2 px-5 border-b border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <Layers size={12} /> Timeline
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {state.slides.map((slide, idx) => {
              const isActive = idx === state.currentSlideIndex;
              return (
                <div
                  key={slide.id}
                  onClick={() => setSlide(idx)}
                  className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 relative ${
                    isActive 
                      ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20 opacity-100' 
                      : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-white/20'
                  }`}
                >
                  <div className="aspect-video bg-zinc-900 relative">
                     {/* Mini Preview */}
                     <div 
                        className="absolute inset-0 flex items-center justify-center p-2 text-center text-[6px] leading-tight select-none overflow-hidden"
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontFamily: state.theme.fontFamily,
                          background: state.theme.type === 'color' ? state.theme.value : state.theme.type === 'gradient' ? state.theme.value : '#000'
                        }}
                     >
                        <div className="line-clamp-4 scale-90">{slide.content}</div>
                        {state.theme.type === 'image' && (
                          <div className="absolute inset-0 -z-10 bg-zinc-900 opacity-60" />
                        )}
                     </div>
                     
                     {/* Number Badge */}
                     <div className={`absolute top-1.5 left-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-md text-[9px] font-bold ${
                       isActive ? 'bg-indigo-500 text-white' : 'bg-black/50 text-white/70 backdrop-blur-md'
                     }`}>
                       {idx + 1}
                     </div>
                  </div>
                </div>
              );
            })}
            
            {state.slides.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-700">
                <Sparkles size={24} className="mb-2 opacity-50"/>
                <span className="text-xs">No slides yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;