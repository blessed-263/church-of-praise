import React, { useMemo, useState } from "react";
import { PenLine, Search } from "lucide-react";
import { findSong, lyricSlides, SONG_LIBRARY, Song } from "../services/songLibrary";

interface MusicLibraryProps {
  rawText: string;
  currentSlideIndex: number;
  onSelectLyric: (lyrics: string, index: number) => void;
  onTextChange: (text: string) => void;
}

function splitLyric(text: string): { label: string; body: string } {
  const lines = text.split("\n");
  const first = lines[0]?.trim() ?? "";
  const isSection = /^(verse|chorus|bridge|post-chorus|tag|pre-chorus|intro|outro)\b/i.test(first);
  if (isSection && lines.length > 1) {
    return { label: first.replace(/:$/, ""), body: lines.slice(1).join("\n").trim() };
  }
  return { label: "", body: text.trim() };
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  rawText,
  currentSlideIndex,
  onSelectLyric,
  onTextChange,
}) => {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const activeSong = findSong(rawText);
  const hasCustom = rawText.trim().length > 0 && !activeSong;
  const projectingLyrics = activeSong?.lyrics ?? (hasCustom ? rawText : "");
  const projectingTitle = activeSong?.title ?? (hasCustom ? "Custom lyrics" : "");

  const songs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SONG_LIBRARY;
    return SONG_LIBRARY.filter(
      (song) =>
        song.title.toLowerCase().includes(needle) ||
        song.lyrics.toLowerCase().includes(needle)
    );
  }, [query]);

  const chooseSong = (song: Song) => {
    onSelectLyric(song.lyrics, 0);
    setQuery("");
    setSearchOpen(false);
  };

  if (writing) {
    return (
      <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => setWriting(false)}
              className="px-4 py-2 rounded-full bg-white border border-stone-200 text-sm text-stone-700 hover:border-stone-400"
            >
              Back
            </button>
            <button
              onClick={() => {
                onTextChange(draft);
                onSelectLyric(draft, 0);
                setWriting(false);
              }}
              className="px-4 py-2 rounded-full bg-[#4f7a68] hover:bg-[#406557] text-white text-sm"
            >
              Project song
            </button>
          </div>
          <textarea
            className="flex-1 w-full bg-white text-stone-800 p-6 rounded-3xl border border-stone-200 focus:outline-none resize-none font-sans text-base leading-7 placeholder-stone-400"
            placeholder="Paste lyrics here. Use a blank line between slides."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            autoFocus
          />
        </div>
      </div>
    );
  }

  const slides = projectingLyrics ? lyricSlides(projectingLyrics) : [];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="pt-2 pb-5 flex items-start gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setSearchOpen(false)}
              placeholder="Search a song"
              className="w-full bg-white border border-stone-200 rounded-full pl-11 pr-4 py-3 text-sm text-stone-800 focus:outline-none placeholder-stone-400"
            />
            {searchOpen && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(62,48,38,0.12)]">
                {songs.length === 0 && (
                  <p className="px-5 py-4 text-sm text-stone-500">No songs match that search.</p>
                )}
                {songs.map((song) => (
                  <button
                    key={song.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => chooseSong(song)}
                    className={`w-full text-left px-5 py-3 text-sm hover:bg-stone-50 ${
                      activeSong?.title === song.title ? "text-[#4f7a68] font-medium" : "text-stone-800"
                    }`}
                  >
                    {song.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setDraft(hasCustom ? rawText : "");
              setWriting(true);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-stone-200 text-sm text-stone-700 hover:border-stone-400 shrink-0"
          >
            <PenLine size={14} />
            Write
          </button>
        </div>

        {projectingTitle && (
          <h2 className="font-display text-4xl text-stone-800 leading-none pb-4">{projectingTitle}</h2>
        )}

        {slides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {slides.map((text, index) => {
              const { label, body } = splitLyric(text);
              const selected = index === currentSlideIndex;
              return (
                <button
                  key={`${projectingTitle}-${index}`}
                  onClick={() => onSelectLyric(projectingLyrics, index)}
                  className={`text-left rounded-3xl border bg-white px-5 py-4 transition hover:-translate-y-0.5 ${
                    selected
                      ? "border-[#4f7a68] ring-2 ring-[#4f7a68]/25"
                      : "border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <span className="text-[11px] tracking-wide uppercase text-[#4f7a68]">
                    {label || `Part ${index + 1}`}
                  </span>
                  <p className="mt-2 whitespace-pre-wrap text-stone-800 leading-relaxed text-[15px]">{body}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicLibrary;
