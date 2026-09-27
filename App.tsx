import React, { useEffect, useRef, useState } from 'react';
import { Slide, AppState, SlideTheme, OfferingConfig, INITIAL_THEME, INITIAL_OFFERING, INITIAL_LYRICS } from './types';
import Editor from './components/Editor';
import SlideDisplay from './components/SlideDisplay';
import Controls from './components/Controls';
import { ArrowLeft, Book, Layers, Monitor, Music2, QrCode, Radio, Settings2 } from 'lucide-react';
import MusicLibrary from './components/MusicLibrary';
import { EditorTab } from './components/Editor';
import { findSong, lyricSlides } from './services/songLibrary';
import { createLiveBroadcaster } from './services/liveBroadcast';
import { LIVE_CHANNEL, LiveSnapshot } from './services/serviceTypes';
import { createServicePersister, hydrateService, SyncStatus } from './services/serviceSync';

const defaultState = (): AppState => ({
  rawText: INITIAL_LYRICS,
  slides: [],
  currentSlideIndex: 0,
  isBlackout: false,
  isClear: false,
  isOffering: false,
  theme: INITIAL_THEME,
  offeringConfig: INITIAL_OFFERING,
});

function projectorHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Church of Praise - Output</title>
        <link href="https://fonts.googleapis.com/css2?family=Allura&family=Amiri:wght@400;700&family=Bebas+Neue&family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,500;0,700&family=Crimson+Pro:wght@600;700&family=DM+Sans:wght@400;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Great+Vibes&family=Instrument+Serif:ital@0;1&family=Italiana&family=Josefin+Sans:wght@600;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@500;700&family=Montserrat:wght@700;800&family=Newsreader:opsz,wght@6..72,600;6..72,700&family=Outfit:wght@600;700;800&family=Playfair+Display:wght@500;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Spectral:wght@600;700&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; overflow: hidden; background: #efe6d6; font-family: 'Fraunces', serif; }
          #root { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; }
          .fade-enter { opacity: 0; transform: translateY(10px); }
          .fade-enter-active { opacity: 1; transform: translateY(0); transition: opacity 0.4s ease, transform 0.4s ease; }
          .fade-exit { opacity: 1; position: absolute; }
          .fade-exit-active { opacity: 0; transform: translateY(-10px); transition: opacity 0.4s ease, transform 0.4s ease; }
          .slide-content {
            position: absolute; width: 100%; padding: 0 5vw;
            text-shadow: 0 6px 28px rgba(62,48,38,0.35); text-align: center; white-space: pre-wrap; letter-spacing: -0.02em;
          }
          .offering-card {
            background: #fffaf4; border-radius: 28px; padding: 4rem 6rem; text-align: center;
            display: flex; flex-direction: column; align-items: center;
            border: 1px solid #e7dfd3;
            position: absolute; z-index: 20; max-width: 80vw;
          }
          .bg-overlay { position: absolute; inset: 0; background: #3a2f26; transition: opacity 0.5s ease; z-index: 0; }
        </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const CHANNEL = ${JSON.stringify(LIVE_CHANNEL)};
    const root = document.getElementById('root');
    let currentContent = null;
    let currentMode = 'normal';
    let latest = null;

    let mouseTimer = null;
    document.addEventListener('mousemove', () => {
      document.body.style.cursor = 'default';
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => { document.body.style.cursor = 'none'; }, 2000);
    });

    document.addEventListener('dblclick', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    });

    const hint = document.createElement('div');
    hint.textContent = "Double-click for Fullscreen";
    hint.style.cssText = "position:absolute;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-family:sans-serif;font-size:12px;pointer-events:none;z-index:9999;background:#000;padding:4px 12px;border-radius:6px;";
    document.body.appendChild(hint);
    setTimeout(() => { hint.style.opacity = '0'; setTimeout(() => hint.remove(), 1000); }, 4000);

    function render(data) {
      try {
        if (data) latest = data;
        if (!latest) return;
        const { theme, isBlackout, isClear, isOffering, offeringConfig, currentSlideIndex, computedSlides } = latest;
        const nextContentText = computedSlides && computedSlides[currentSlideIndex] ? computedSlides[currentSlideIndex].content : '';

        if (theme.type === 'image') {
          const origin = (window.opener && window.opener.location) ? window.opener.location.origin : window.location.origin;
          const imgUrl = (typeof theme.value === 'string' && theme.value.startsWith('/')) ? origin + theme.value : theme.value;
          document.body.style.background = 'url(' + imgUrl + ') center/cover no-repeat';
        } else {
          document.body.style.background = theme.value;
        }

        if (isBlackout) {
          root.innerHTML = '';
          document.body.style.backgroundColor = '#1a1612';
          document.body.style.backgroundImage = 'none';
          currentContent = null;
          return;
        }

        let overlay = document.getElementById('bg-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'bg-overlay';
          overlay.className = 'bg-overlay';
          root.prepend(overlay);
        }
        overlay.style.opacity = theme.overlayOpacity;

        if (isOffering && offeringConfig) {
          if (currentMode !== 'offering') {
            document.querySelectorAll('.slide-content').forEach(el => el.remove());
            const container = document.createElement('div');
            container.className = 'offering-card fade-enter';
            void container.offsetWidth;
            container.classList.add('fade-enter-active');

            const title = document.createElement('h1');
            title.textContent = offeringConfig.title;
            title.style.cssText = 'font-size:5vw;font-weight:700;color:#3f3832;margin:0 0 2rem 0;line-height:0.9;font-family:Fraunces,serif';

            const img = document.createElement('img');
            const origin = (window.opener && window.opener.location) ? window.opener.location.origin : window.location.origin;
            img.src = (offeringConfig.qrImageUrl && offeringConfig.qrImageUrl.startsWith('/'))
              ? origin + offeringConfig.qrImageUrl
              : offeringConfig.qrImageUrl;
            img.style.cssText = 'width:min(32vw,420px);height:min(32vw,420px);object-fit:contain;border-radius:24px;margin-bottom:1.5rem;background:#fff;padding:1rem;border:1px solid #e7dfd3';

            const sub = document.createElement('p');
            sub.textContent = offeringConfig.subTitle;
            sub.style.cssText = 'font-size:2vw;font-weight:400;color:#52525b;margin:0';

            if (offeringConfig.title) container.appendChild(title);
            if (offeringConfig.qrImageUrl) container.appendChild(img);
            if (offeringConfig.subTitle) container.appendChild(sub);
            root.appendChild(container);
            currentMode = 'offering';
          }
          return;
        } else if (currentMode === 'offering') {
          const offCard = document.querySelector('.offering-card');
          if (offCard) offCard.remove();
          currentMode = 'normal';
        }

        const shouldShowText = !isClear && nextContentText;
        if (shouldShowText && nextContentText !== currentContent) {
          const oldContent = document.querySelector('.slide-content.active');
          if (oldContent) {
            oldContent.classList.remove('active');
            oldContent.classList.add('fade-exit', 'fade-exit-active');
            setTimeout(() => oldContent.remove(), 400);
          }
          const textContainer = document.createElement('div');
          textContainer.className = 'slide-content active fade-enter';
          textContainer.style.zIndex = '10';
          textContainer.style.color = 'white';
          textContainer.style.fontFamily = theme.fontFamily;
          textContainer.style.fontWeight = '700';
          textContainer.style.lineHeight = '1.1';
          textContainer.style.fontSize = (5 * (theme.fontSize || 1)) + 'vw';
          textContainer.textContent = nextContentText;
          root.appendChild(textContainer);
          requestAnimationFrame(() => textContainer.classList.add('fade-enter-active'));
          currentContent = nextContentText;
        } else if (!shouldShowText) {
          const oldContent = document.querySelector('.slide-content.active');
          if (oldContent) {
            oldContent.classList.remove('active');
            oldContent.classList.add('fade-exit', 'fade-exit-active');
            setTimeout(() => oldContent.remove(), 400);
          }
          currentContent = null;
        }
      } catch (e) { console.error(e); }
    }

    window.addEventListener('message', (e) => {
      if (!e.data || e.data.type !== CHANNEL) return;
      render(e.data.payload);
    });
    try {
      const ch = new BroadcastChannel(CHANNEL);
      ch.onmessage = (e) => render(e.data);
    } catch (e) {}
  </script>
</body>
</html>`;
}

function SlideRail({
  slides,
  currentIndex,
  theme,
  onSelect,
}: {
  slides: Slide[];
  currentIndex: number;
  theme: SlideTheme;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const thumbBg =
          theme.type === 'image' ? `url(${theme.value}) center/cover no-repeat` : theme.value;
        return (
          <div
            key={slide.id}
            onClick={() => onSelect(idx)}
            className={`cursor-pointer overflow-hidden rounded-2xl border ${
              isActive ? 'border-[#4f7a68] ring-2 ring-[#4f7a68]/20' : 'border-stone-200 hover:border-stone-400'
            }`}
          >
            <div className="aspect-video bg-stone-100 relative">
              <div
                className="absolute inset-0 flex items-center justify-center p-2 text-center text-[6px] leading-tight select-none overflow-hidden"
                style={{
                  color: 'rgba(255,255,255,0.95)',
                  fontFamily: theme.fontFamily,
                  background: thumbBg,
                  textShadow: '0 1px 8px rgba(62,48,38,0.45)',
                }}
              >
                <div className="line-clamp-4 relative z-10">{slide.content}</div>
              </div>
              <div
                className={`absolute top-1.5 left-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[9px] font-medium rounded-full ${
                  isActive ? 'bg-[#4f7a68] text-white' : 'bg-white/90 text-stone-600 border border-stone-200'
                }`}
              >
                {idx + 1}
              </div>
            </div>
          </div>
        );
      })}

      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-stone-400">
          <span className="text-xs">No slides yet</span>
        </div>
      )}
    </div>
  );
}

function App() {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('cached');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screen, setScreen] = useState<'music' | EditorTab>('music');
  const [editorTab, setEditorTab] = useState<EditorTab>('bible');
  const [showPreview, setShowPreview] = useState(false);
  const livePreviewRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef(createLiveBroadcaster());
  const persistRef = useRef<ReturnType<typeof createServicePersister> | null>(null);

  useEffect(() => {
    const live = createLiveBroadcaster();
    liveRef.current = live;
    const persister = createServicePersister(setSyncStatus);
    persistRef.current = persister;

    let cancelled = false;
    hydrateService().then(({ service, status }) => {
      if (cancelled) return;
        const cachedTheme = service.theme || INITIAL_THEME;
        const isLegacyDefault = [
          '/backgrounds/blue-fluid.jpg',
          '/backgrounds/purple-gradient.jpg',
          '/backgrounds/liquid.jpg',
          '/backgrounds/shapes.jpg',
        ].includes(cachedTheme.value);
        setState((prev) => ({
          ...prev,
          rawText: service.rawText,
          theme: {
            ...INITIAL_THEME,
            ...cachedTheme,
            ...(isLegacyDefault
              ? { value: INITIAL_THEME.value, type: INITIAL_THEME.type, fontFamily: INITIAL_THEME.fontFamily }
              : {}),
          },
          offeringConfig: {
            ...INITIAL_OFFERING,
            ...service.offeringConfig,
            qrImageUrl: INITIAL_OFFERING.qrImageUrl,
            ...(service.offeringConfig?.title === 'Giving'
              ? { title: INITIAL_OFFERING.title }
              : {}),
          },
        }));
      setSyncStatus(status);
      setHydrated(true);
    });

    return () => {
      cancelled = true;
      persister.dispose();
      live.close();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistRef.current?.persist({
      rawText: state.rawText,
      theme: state.theme,
      offeringConfig: state.offeringConfig,
    });
  }, [hydrated, state.rawText, state.theme, state.offeringConfig]);

  useEffect(() => {
    const snapshot: LiveSnapshot = {
      theme: state.theme,
      isBlackout: state.isBlackout,
      isClear: state.isClear,
      isOffering: state.isOffering,
      offeringConfig: state.offeringConfig,
      currentSlideIndex: state.currentSlideIndex,
      computedSlides: state.slides,
    };
    liveRef.current.send(snapshot);
  }, [state]);

  useEffect(() => {
    const segments = state.rawText
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newSlides: Slide[] = segments.map((content, idx) => ({
      id: `slide-${idx}`,
      content,
    }));

    setState((prev) => ({
      ...prev,
      slides: newSlides,
      currentSlideIndex: Math.min(prev.currentSlideIndex, Math.max(0, newSlides.length - 1)),
    }));
  }, [state.rawText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      switch (e.key) {
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
    setState((prev) => ({ ...prev, rawText: text }));
  };

  const openScreen = (next: 'music' | EditorTab) => {
    setScreen(next);
    if (next === 'music') {
      setShowPreview(false);
      return;
    }
    setEditorTab(next);
  };

  const selectLyric = (lyrics: string, index: number) => {
    setState((prev) => {
      const sameSong = prev.rawText.trim() === lyrics.trim();
      const slides = sameSong
        ? prev.slides
        : lyricSlides(lyrics).map((content, idx) => ({ id: `slide-${idx}`, content }));
      return {
        ...prev,
        rawText: lyrics,
        slides,
        currentSlideIndex: index,
        isBlackout: false,
        isClear: false,
        isOffering: false,
      };
    });
  };

  const updateTheme = (themeUpdates: Partial<SlideTheme>) => {
    setState((prev) => ({ ...prev, theme: { ...prev.theme, ...themeUpdates } }));
  };

  const updateOffering = (config: Partial<OfferingConfig>) => {
    setState((prev) => ({
      ...prev,
      offeringConfig: {
        ...prev.offeringConfig,
        ...config,
        qrImageUrl: INITIAL_OFFERING.qrImageUrl,
      },
    }));
  };

  const setSlide = (index: number) => {
    setState((prev) => ({ ...prev, currentSlideIndex: index, isBlackout: false, isOffering: false }));
  };

  const nextSlide = () => {
    setState((prev) => {
      if (prev.isOffering) return prev;
      if (prev.currentSlideIndex >= prev.slides.length - 1) return prev;
      return { ...prev, currentSlideIndex: prev.currentSlideIndex + 1 };
    });
  };

  const prevSlide = () => {
    setState((prev) => {
      if (prev.isOffering) return prev;
      if (prev.currentSlideIndex <= 0) return prev;
      return { ...prev, currentSlideIndex: prev.currentSlideIndex - 1 };
    });
  };

  const toggleBlackout = () => setState((prev) => ({ ...prev, isBlackout: !prev.isBlackout }));
  const toggleClear = () => setState((prev) => ({ ...prev, isClear: !prev.isClear }));
  const toggleOffering = () => setState((prev) => ({ ...prev, isOffering: !prev.isOffering, isBlackout: false }));

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

  const openProjectorWindow = () => {
    const width = 1280;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const win = window.open(
      '',
      'ChurchOfPraiseProjector',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (!win) {
      alert('Pop-up blocked! Please allow pop-ups.');
      return;
    }

    win.document.open();
    win.document.write(projectorHtml());
    win.document.close();
    liveRef.current.setProjector(win);
    liveRef.current.send({
      theme: state.theme,
      isBlackout: state.isBlackout,
      isClear: state.isClear,
      isOffering: state.isOffering,
      offeringConfig: state.offeringConfig,
      currentSlideIndex: state.currentSlideIndex,
      computedSlides: state.slides,
    });
  };

  const currentContent = state.slides[state.currentSlideIndex]?.content || '';
  const statusLabel =
    syncStatus === 'saved' ? 'Saved' :
    syncStatus === 'saving' ? 'Saving' :
    syncStatus === 'offline' ? 'Offline' : 'Cached';
  const onMusic = screen === 'music';
  const onMusicPreview = onMusic && showPreview;
  const activeSongTitle = findSong(state.rawText)?.title ?? 'Custom lyrics';
  const modes: { id: 'music' | EditorTab; label: string; icon: typeof Music2 }[] = [
    { id: 'music', label: 'Music', icon: Music2 },
    { id: 'bible', label: 'Bible', icon: Book },
    { id: 'theme', label: 'Style', icon: Settings2 },
    { id: 'offering', label: 'Offering', icon: QrCode },
  ];

  return (
    <div className="flex flex-col h-screen text-stone-800 overflow-hidden bg-[#f6f1ea] font-sans">
      <header className="shrink-0 select-none z-30 bg-[#f6f1ea]">
        <div className="h-14 flex items-center px-5 justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-base leading-none text-stone-800 truncate">Church of Praise</h1>
            <span className="text-[10px] text-stone-500 leading-none mt-1 block tracking-wide">International Youth</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-stone-500 px-3 py-1.5 border border-stone-200 rounded-full bg-white/70">
            {statusLabel}
          </span>
          <button
            onClick={openProjectorWindow}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#4f7a68] hover:bg-[#406557] text-white text-xs font-medium rounded-full"
          >
            <Monitor size={14} />
            <span>Projector</span>
          </button>

          {isFullscreen && (
            <div className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-semibold">
              <Radio size={12} />
              LIVE
            </div>
          )}
        </div>
        </div>
        <div className="flex justify-center px-5 pb-3">
          <div className="flex items-center gap-1 p-1 bg-white border border-stone-200 rounded-full">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => openScreen(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  screen === mode.id ? 'bg-[#4f7a68] text-white' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <mode.icon size={13} />
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative px-3 pb-3 gap-3">
        <div className={`${onMusic ? 'hidden' : 'w-[380px] shrink-0 z-20 flex flex-col bg-white border border-stone-200 rounded-3xl overflow-hidden'}`}>
          <Editor
            rawText={state.rawText}
            onTextChange={updateText}
            onThemeChange={updateTheme}
            currentTheme={state.theme}
            offeringConfig={state.offeringConfig}
            onOfferingChange={updateOffering}
            activeTab={editorTab}
            showTabs={false}
          />
        </div>

        {onMusic && !showPreview ? (
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <MusicLibrary
              rawText={state.rawText}
              currentSlideIndex={state.currentSlideIndex}
              onSelectLyric={selectLyric}
              onTextChange={updateText}
            />
            <div className="shrink-0 flex justify-center pb-3">
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
        ) : (
        <div className="flex-1 flex flex-col relative bg-transparent rounded-3xl min-w-0">
          {onMusicPreview && (
            <div className="flex items-center justify-between gap-3 px-2 pt-1">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-sm text-stone-700 hover:border-stone-400"
              >
                <ArrowLeft size={14} />
                Lyrics
              </button>
              <p className="font-display text-lg text-stone-800 truncate">{activeSongTitle}</p>
              <span className="w-24" />
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-hidden relative">
            <div
              ref={livePreviewRef}
              className={`relative overflow-hidden ${
                isFullscreen
                  ? 'w-full h-full fixed inset-0 z-50'
                  : 'aspect-video w-full max-w-5xl border border-stone-200 rounded-3xl shadow-[0_18px_50px_rgba(62,48,38,0.12)]'
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
                <div className="absolute top-3 right-3 pointer-events-none z-50">
                  <div className="bg-white/90 text-stone-500 text-[9px] font-medium px-2.5 py-1 rounded-full border border-stone-200">
                    PREVIEW
                  </div>
                </div>
              )}
            </div>
          </div>

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
        )}

        {!onMusic && (
          <div className="w-64 bg-white border border-stone-200 rounded-3xl flex flex-col shrink-0 z-10 overflow-hidden">
            <div className="h-12 flex items-center gap-2 px-4 text-[11px] font-medium text-stone-500">
              <Layers size={12} /> Timeline
            </div>
            <SlideRail
              slides={state.slides}
              currentIndex={state.currentSlideIndex}
              theme={state.theme}
              onSelect={setSlide}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
