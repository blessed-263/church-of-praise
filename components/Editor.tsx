import React, { useEffect, useMemo, useState } from "react";
import {
	Type,
	Plus,
	Check,
	QrCode,
	Upload,
	Settings2,
	AlignLeft,
	Book,
	ChevronRight,
	Search,
} from "lucide-react";
import { SlideTheme, OfferingConfig, INITIAL_THEME } from "../types";
import { BibleVersion, BibleVerse, fetchChapter } from "../services/bibleService";
import { BIBLE_BOOKS, parsePassageQuery, searchBibleBooks } from "../services/bibleBooks";
import { SONG_LIBRARY } from "../services/songLibrary";

export type EditorTab = "lyrics" | "bible" | "theme" | "offering";

interface EditorProps {
	rawText: string;
	onTextChange: (text: string) => void;
	onThemeChange: (theme: Partial<SlideTheme>) => void;
	currentTheme: SlideTheme;
	offeringConfig: OfferingConfig;
	onOfferingChange: (config: Partial<OfferingConfig>) => void;
	activeTab?: EditorTab;
	onTabChange?: (tab: EditorTab) => void;
	showTabs?: boolean;
}

// Modern, Abstract, Youth-oriented Presets
const PRESET_FONTS = [
  { name: 'Fraunces', value: '"Fraunces", serif' },
  { name: 'Jakarta', value: '"Plus Jakarta Sans", sans-serif' },
  { name: 'Cormorant', value: '"Cormorant Garamond", serif' },
  { name: 'Newsreader', value: '"Newsreader", serif' },
  { name: 'Instrument', value: '"Instrument Serif", serif' },
  { name: 'DM Sans', value: '"DM Sans", sans-serif' },
  { name: 'Playfair', value: '"Playfair Display", serif' },
  { name: 'Lora', value: '"Lora", serif' },
  { name: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
  { name: 'Spectral', value: '"Spectral", serif' },
  { name: 'Crimson', value: '"Crimson Pro", serif' },
  { name: 'Cinzel', value: '"Cinzel", serif' },
  { name: 'Outfit', value: '"Outfit", sans-serif' },
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Josefin', value: '"Josefin Sans", sans-serif' },
  { name: 'Bebas', value: '"Bebas Neue", sans-serif' },
  { name: 'Italiana', value: '"Italiana", serif' },
  { name: 'Great Vibes', value: '"Great Vibes", cursive' },
  { name: 'Allura', value: '"Allura", cursive' },
  { name: 'Amiri', value: '"Amiri", serif' },
];

const PRESET_IMAGES = [
  '/backgrounds/sanctuary-light.jpg',
  '/backgrounds/dawn-water.jpg',
  '/backgrounds/olive-hills.jpg',
  '/backgrounds/gold-bokeh.jpg',
  '/backgrounds/soft-clouds.jpg',
  '/backgrounds/morning-ocean.jpg',
  '/backgrounds/wildflower-meadow.jpg',
  '/backgrounds/open-word.jpg',
  '/backgrounds/desert-sunrise.jpg',
  '/backgrounds/forest-mist.jpg',
  '/backgrounds/stained-glass.jpg',
  '/backgrounds/wheat-field.jpg',
  '/backgrounds/still-lake.jpg',
  '/backgrounds/candle-glow.jpg',
  '/backgrounds/open-sky.jpg',
  '/backgrounds/linen-light.jpg',
  '/backgrounds/christmas-lights.jpg',
  '/backgrounds/winter-snow.jpg',
  '/backgrounds/christmas-tree.jpg',
  '/backgrounds/nativity-star.jpg',
  '/backgrounds/cross-sunset.jpg',
  '/backgrounds/clouds-blue.jpg',
  '/backgrounds/open-bible.jpg',
  '/backgrounds/worship-hands.jpg',
  '/backgrounds/abstract-gold.jpg',
  '/backgrounds/morning-landscape.jpg',
  '/backgrounds/ocean-waves.jpg',
  '/backgrounds/mountains.jpg',
  '/backgrounds/starry-sky.jpg',
  '/backgrounds/aurora.jpg',
];

const PRESET_COLORS = [
	{ name: "Cream", value: "#efe6d6" },
	{ name: "Sand", value: "#d8c4a4" },
	{ name: "Sage", value: "#7d9a86" },
	{ name: "Sky", value: "#8aa4b5" },
	{ name: "Clay", value: "#c4a484" },
	{ name: "Linen", value: "#f3eee6" },
];

const Editor: React.FC<EditorProps> = ({
	rawText,
	onTextChange,
	onThemeChange,
	currentTheme,
	offeringConfig,
	onOfferingChange,
	activeTab: controlledTab,
	onTabChange,
	showTabs = true,
}) => {
	const [internalTab, setInternalTab] = useState<EditorTab>("lyrics");
	const activeTab = controlledTab ?? internalTab;
	const setActiveTab = (tab: EditorTab) => {
		onTabChange?.(tab);
		if (controlledTab === undefined) setInternalTab(tab);
	};

	// Bible State
	const [bibleVersion, setBibleVersion] = useState<BibleVersion>("web");
	const [bibleBook, setBibleBook] = useState("John");
	const [bibleChapter, setBibleChapter] = useState(3);
	const [bibleVerse, setBibleVerse] = useState(16);
	const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
	const [isLoadingVerse, setIsLoadingVerse] = useState(false);
	const [bibleError, setBibleError] = useState("");
	const [bibleSearch, setBibleSearch] = useState("");
	const [scriptureSet, setScriptureSet] = useState<BibleVerse[]>([]);

	const selectedBook = useMemo(
		() => BIBLE_BOOKS.find((book) => book.name === bibleBook) || BIBLE_BOOKS[0],
		[bibleBook]
	);
	const selectedPassage = chapterVerses.find((item) => item.verse === bibleVerse) || null;
	const nextPassage = chapterVerses.find((item) => item.verse === bibleVerse + 1) || null;
	const parsedSearch = useMemo(() => parsePassageQuery(bibleSearch), [bibleSearch]);
	const bookHits = useMemo(() => (bibleSearch.trim() ? searchBibleBooks(bibleSearch) : []), [bibleSearch]);
	const visibleVerses = useMemo(() => {
		const query = bibleSearch.trim().toLowerCase();
		if (!query || parsedSearch.book) return chapterVerses;
		return chapterVerses.filter(
			(item) =>
				String(item.verse).startsWith(query) ||
				item.text.toLowerCase().includes(query)
		);
	}, [bibleSearch, chapterVerses, parsedSearch.book]);

	const applyPassage = (bookName: string, chapter?: number | null, verse?: number | null) => {
		const book = BIBLE_BOOKS.find((item) => item.name === bookName);
		if (!book) return;
		setBibleBook(book.name);
		const nextChapter =
			chapter && chapter >= 1 && chapter <= book.chapters ? chapter : 1;
		setBibleChapter(nextChapter);
		setBibleVerse(verse && verse >= 1 ? verse : 1);
	};

	const submitBibleSearch = () => {
		if (parsedSearch.book) {
			applyPassage(parsedSearch.book.name, parsedSearch.chapter, parsedSearch.verse);
			return;
		}
		if (bookHits[0]) {
			applyPassage(bookHits[0].name);
		}
	};

	useEffect(() => {
		if (!parsedSearch.book || !parsedSearch.chapter || !parsedSearch.verse) return;
		applyPassage(parsedSearch.book.name, parsedSearch.chapter, parsedSearch.verse);
	}, [parsedSearch.book?.name, parsedSearch.chapter, parsedSearch.verse]);

	useEffect(() => {
		if (activeTab !== "bible") return;
		let cancelled = false;
		setIsLoadingVerse(true);
		setBibleError("");
		fetchChapter(`${bibleBook} ${bibleChapter}`, bibleVersion)
			.then((chapter) => {
				if (cancelled) return;
				if (!chapter || chapter.verses.length === 0) {
					setChapterVerses([]);
					setBibleError("Chapter not found.");
					return;
				}
				setChapterVerses(chapter.verses);
				setBibleVerse((prev) => {
					const exists = chapter.verses.some((item) => item.verse === prev);
					return exists ? prev : chapter.verses[0].verse;
				});
			})
			.catch(() => {
				if (!cancelled) {
					setChapterVerses([]);
					setBibleError("Connection error.");
				}
			})
			.finally(() => {
				if (!cancelled) setIsLoadingVerse(false);
			});
		return () => {
			cancelled = true;
		};
	}, [activeTab, bibleBook, bibleChapter, bibleVersion]);

	useEffect(() => {
		setScriptureSet([]);
	}, [bibleBook, bibleChapter]);

	const writeScripture = (verses: BibleVerse[]) => {
		setScriptureSet(verses);
		onTextChange(verses.map((item) => `${item.reference}\n${item.text}`).join("\n\n"));
	};

	const startScripture = (passage: BibleVerse) => {
		writeScripture([passage]);
	};

	const appendPassage = (passage: BibleVerse) => {
		if (scriptureSet.some((item) => item.reference === passage.reference)) {
			writeScripture(scriptureSet);
			return;
		}
		writeScripture(scriptureSet.length === 0 ? [passage] : [...scriptureSet, passage]);
	};

	const addVerseToSlides = () => {
		if (!selectedPassage) return;
		startScripture(selectedPassage);
	};

	const addNextVerse = () => {
		if (!nextPassage) return;
		if (scriptureSet.length === 0 && selectedPassage) {
			writeScripture([selectedPassage, nextPassage]);
		} else {
			appendPassage(nextPassage);
		}
		setBibleVerse(nextPassage.verse);
	};

	const handleFileUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		callback: (url: string) => void
	) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				callback(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="flex flex-col h-full bg-transparent">
			{showTabs && (
			<div className="px-4 py-3 shrink-0">
				<div className="flex gap-1 p-1 bg-stone-100 rounded-2xl">
					{[
						{ id: "lyrics", icon: AlignLeft, label: "Text" },
						{ id: "bible", icon: Book, label: "Bible" },
						{ id: "theme", icon: Settings2, label: "Style" },
						{ id: "offering", icon: QrCode, label: "Offering" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium ${
								activeTab === tab.id
									? "bg-white text-[#4f7a68] shadow-sm"
									: "text-stone-500 hover:text-stone-800"
							}`}
						>
							<tab.icon size={14} />
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>
			)}

			{/* Content Area */}
			<div className="flex-1 flex flex-col min-h-0 relative">
				{/* LYRICS TAB */}
				{activeTab === "lyrics" && (
					<div className="flex flex-col h-full">
						<div className="px-4 pb-2 flex items-center justify-between gap-2">
							<div className="flex items-center gap-2 flex-1">
								<span className="text-[11px] font-medium text-stone-500 shrink-0">
									Editor
								</span>
								<select
									className="bg-white border border-stone-200 rounded-xl px-2 py-1 text-xs text-stone-800 focus:outline-none w-full max-w-[180px]"
									onChange={(e) => {
										const song = SONG_LIBRARY.find((s) => s.title === e.target.value);
										if (song) {
											setScriptureSet([]);
											onTextChange(song.lyrics);
										}
										e.target.value = "";
									}}
									defaultValue=""
								>
									<option value="" disabled>
										Load Song...
									</option>
									{SONG_LIBRARY.map((song) => (
										<option key={song.title} value={song.title}>
											{song.title}
										</option>
									))}
								</select>
							</div>
							<button
								onClick={() => {
									if (confirm("Clear all text?")) {
										setScriptureSet([]);
										onTextChange("");
									}
								}}
								className="text-[11px] font-medium text-stone-500 hover:text-red-600 shrink-0"
							>
								Clear All
							</button>
						</div>

						<textarea
							className="flex-1 w-full bg-transparent text-stone-800 p-4 border-none focus:ring-0 focus:outline-none resize-none font-sans text-sm leading-7 placeholder-stone-400"
							placeholder="Paste lyrics here...&#10;&#10;Use double blank lines to separate slides."
							value={rawText}
							onChange={(e) => onTextChange(e.target.value)}
							spellCheck={false}
						/>
					</div>
				)}

				{/* BIBLE TAB */}
				{activeTab === "bible" && (
					<div className="p-4 space-y-4 overflow-y-auto h-full">
						<div className="space-y-3">
							<label className="text-[11px] font-medium text-stone-500">
								Scripture
							</label>
							<div className="relative">
								<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
								<input
									type="text"
									value={bibleSearch}
									onChange={(e) => setBibleSearch(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											submitBibleSearch();
										}
									}}
									placeholder="Search John 3:16, Psalms, love..."
									className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-sm text-stone-800 focus:outline-none placeholder-stone-400"
								/>
							</div>
							{bookHits.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{bookHits.map((book) => (
										<button
											key={book.name}
											onClick={() => {
												applyPassage(
													book.name,
													parsedSearch.book?.name === book.name ? parsedSearch.chapter : 1,
													parsedSearch.book?.name === book.name ? parsedSearch.verse : 1
												);
												if (parsedSearch.book?.name === book.name && parsedSearch.chapter) {
													setBibleSearch("");
												}
											}}
											className={`px-2.5 py-1 rounded-full text-xs border ${
												book.name === bibleBook
													? "bg-[#4f7a68] text-white border-[#4f7a68]"
													: "bg-white text-stone-700 border-stone-200 hover:border-[#4f7a68]"
											}`}
										>
											{book.name}
										</button>
									))}
								</div>
							)}
							<select
								value={bibleVersion}
								onChange={(e) =>
									setBibleVersion(e.target.value as BibleVersion)
								}
								className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none"
							>
								<option value="web">WEB</option>
								<option value="kjv">KJV</option>
								<option value="bbe">BBE</option>
							</select>
							<select
								value={bibleBook}
								onChange={(e) => {
									setBibleBook(e.target.value);
									setBibleChapter(1);
									setBibleVerse(1);
								}}
								className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none"
							>
								{BIBLE_BOOKS.map((book) => (
									<option key={book.name} value={book.name}>
										{book.name}
									</option>
								))}
							</select>
							<div className="flex gap-2">
								<select
									value={bibleChapter}
									onChange={(e) => {
										setBibleChapter(Number(e.target.value));
										setBibleVerse(1);
									}}
									className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none"
								>
									{Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
										<option key={chapter} value={chapter}>
											Chapter {chapter}
										</option>
									))}
								</select>
								<select
									value={bibleVerse}
									onChange={(e) => setBibleVerse(Number(e.target.value))}
									disabled={chapterVerses.length === 0}
									className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none disabled:opacity-50"
								>
									{chapterVerses.map((item) => (
										<option key={item.verse} value={item.verse}>
											Verse {item.verse}
										</option>
									))}
								</select>
							</div>
							{bibleError && (
								<p className="text-red-600 text-xs text-center">{bibleError}</p>
							)}
						</div>

						{isLoadingVerse && (
							<div className="flex justify-center py-6">
								<div className="animate-spin w-5 h-5 border-2 border-[#4f7a68] border-t-transparent rounded-full" />
							</div>
						)}

						{!isLoadingVerse && selectedPassage && (
							<div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
								<h3 className="text-stone-800 font-display text-lg font-semibold">
									{selectedPassage.reference}
								</h3>
								<p className="text-stone-600 leading-relaxed text-sm">
									{selectedPassage.text}
								</p>
								<button
									onClick={addVerseToSlides}
									className="w-full py-2.5 bg-[#4f7a68] hover:bg-[#406557] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
								>
									<Plus size={16} />
									Add verse
								</button>
								<button
									onClick={addNextVerse}
									disabled={!nextPassage}
									className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
								>
									<ChevronRight size={16} />
									Add next verse
									{nextPassage ? ` (${nextPassage.verse})` : ""}
								</button>
							</div>
						)}

						{!isLoadingVerse && chapterVerses.length > 0 && (
							<div className="space-y-2">
								<label className="text-[11px] font-medium text-stone-500">
									This chapter
								</label>
								<div className="space-y-1 max-h-64 overflow-y-auto pr-1">
									{visibleVerses.length === 0 && (
										<p className="text-xs text-stone-400 px-3 py-2">No matching verses</p>
									)}
									{visibleVerses.map((item) => (
										<div
											key={item.verse}
											className={`flex items-start gap-1 rounded-xl border ${
												item.verse === bibleVerse
													? "border-[#4f7a68] bg-[#4f7a68]/5"
													: "border-transparent hover:bg-stone-50"
											}`}
										>
											<button
												onClick={() => setBibleVerse(item.verse)}
												className="flex-1 text-left px-3 py-2 text-xs leading-snug text-stone-700"
											>
												<span className="font-semibold mr-2">{item.verse}</span>
												{item.text}
											</button>
											<button
												onClick={() => {
													setBibleVerse(item.verse);
													appendPassage(item);
												}}
												className="shrink-0 p-2 text-[#4f7a68] hover:bg-white rounded-xl"
												title={`Add verse ${item.verse}`}
											>
												<Plus size={14} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* THEME TAB */}
				{activeTab === "theme" && (
					<div className="h-full overflow-y-auto">
						<div className="p-4 space-y-8">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<label className="text-[11px] font-medium text-stone-500">
										Visuals
									</label>
									<button
										onClick={() => onThemeChange({ ...INITIAL_THEME })}
										className="text-[11px] text-stone-500 hover:text-stone-800 px-2 py-1 rounded-xl hover:bg-stone-100"
									>
										Reset
									</button>
								</div>

								<div className="grid grid-cols-3 gap-2">
									{PRESET_IMAGES.map((url, i) => (
										<button
											key={i}
											onClick={() =>
												onThemeChange({ type: "image", value: url })
											}
											className={`group relative aspect-video overflow-hidden rounded-2xl border ${
												currentTheme.type === "image" &&
												currentTheme.value === url
													? "border-[#4f7a68]"
													: "border-stone-200 opacity-80 hover:opacity-100"
											}`}
										>
											<img
												src={url}
												alt="background"
												className="w-full h-full object-cover"
											/>
											{currentTheme.type === "image" &&
												currentTheme.value === url && (
													<div className="absolute inset-0 bg-[#3a2f26]/25 flex items-center justify-center">
														<Check
															size={18}
															className="text-white"
														/>
													</div>
												)}
										</button>
									))}
								</div>

								<label className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 cursor-pointer">
									<Upload size={14} />
									<span>Upload Custom BG</span>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) =>
											handleFileUpload(e, (url) =>
												onThemeChange({ type: "image", value: url })
											)
										}
									/>
								</label>
							</div>

							<div className="space-y-3">
								<label className="text-[11px] font-medium text-stone-500">
									Colors
								</label>
								<div className="grid grid-cols-3 gap-2">
									{PRESET_COLORS.map((preset) => (
										<button
											key={preset.name}
											onClick={() =>
												onThemeChange({ type: "color", value: preset.value })
											}
											className={`h-10 rounded-xl border relative ${
												currentTheme.type === "color" &&
												currentTheme.value === preset.value
													? "border-[#4f7a68]"
													: "border-stone-200"
											}`}
											style={{ background: preset.value }}
											title={preset.name}
										>
											{currentTheme.type === "color" &&
												currentTheme.value === preset.value && (
												<div className="absolute inset-0 flex items-center justify-center">
													<Check
														size={14}
														className="text-stone-700"
													/>
												</div>
											)}
										</button>
									))}
								</div>
							</div>

							<div className="space-y-6 pt-6 border-t border-stone-200">
                <div>
                  <label className="text-[11px] font-medium text-stone-500 mb-3 block">
                    Font Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => onThemeChange({ fontFamily: font.value })}
                        className={`px-3 py-2 rounded-xl text-xs border ${
                          currentTheme.fontFamily === font.value
                            ? "bg-[#4f7a68] text-white border-[#4f7a68] font-medium"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

								<div>
									<label className="flex justify-between text-[11px] font-medium text-stone-500 mb-3">
										<span>Dimness</span>
										<span className="text-stone-800">
											{Math.round((currentTheme.overlayOpacity || 0) * 100)}%
										</span>
									</label>
									<input
										type="range"
										min="0"
										max="0.9"
										step="0.05"
										value={currentTheme.overlayOpacity}
										onChange={(e) =>
											onThemeChange({
												overlayOpacity: parseFloat(e.target.value),
											})
										}
										className="w-full accent-[#4f7a68] h-1 bg-stone-200 rounded-xl appearance-none cursor-pointer"
									/>
								</div>

								<div>
									<label className="flex justify-between text-[11px] font-medium text-stone-500 mb-3">
										<span>Text Scale</span>
										<span className="text-stone-800">
											{(currentTheme.fontSize || 1).toFixed(1)}x
										</span>
									</label>
									<div className="flex items-center gap-3">
										<Type size={12} className="text-stone-400" />
										<input
											type="range"
											min="0.5"
											max="2.5"
											step="0.1"
											value={currentTheme.fontSize || 1}
											onChange={(e) =>
												onThemeChange({ fontSize: parseFloat(e.target.value) })
											}
											className="w-full accent-[#4f7a68] h-1 bg-stone-200 rounded-xl appearance-none cursor-pointer"
										/>
										<Type size={16} className="text-stone-700" />
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* OFFERING TAB */}
				{activeTab === "offering" && (
					<div className="p-4 space-y-6 overflow-y-auto h-full">
						<div className="space-y-5">
							<label className="text-[11px] font-medium text-stone-500 block border-b border-stone-200 pb-2">
								Offering
							</label>

							<div className="space-y-2">
								<span className="text-[11px] text-stone-500 font-medium">
									Header
								</span>
								<input
									type="text"
									value={offeringConfig.title}
									onChange={(e) => onOfferingChange({ title: e.target.value })}
									className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none placeholder-stone-400"
								/>
							</div>

							<div className="space-y-2">
								<span className="text-[11px] text-stone-500 font-medium">
									Subtext
								</span>
								<input
									type="text"
									value={offeringConfig.subTitle}
									onChange={(e) =>
										onOfferingChange({ subTitle: e.target.value })
									}
									className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 focus:outline-none placeholder-stone-400"
								/>
							</div>

							<div className="space-y-2">
								<span className="text-[11px] text-stone-500 font-medium">
									QR Code
								</span>
								<p className="text-xs text-stone-500">
									donation.proslavlenie.ru
								</p>
							</div>
						</div>

						<div className="p-6 bg-white rounded-xl flex flex-col items-center gap-4 text-center border border-stone-200">
							<div className="w-40 h-40 bg-white border border-stone-200 rounded-2xl flex items-center justify-center p-2">
								{offeringConfig.qrImageUrl ? (
									<img
										src={offeringConfig.qrImageUrl}
										alt="QR Preview"
										className="w-full h-full object-contain"
									/>
								) : (
									<QrCode className="text-stone-300" size={40} />
								)}
							</div>
							<p className="text-[11px] text-stone-500 font-medium">
								Preview
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Editor;
