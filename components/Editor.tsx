import React, { useState } from "react";
import {
	Type,
	Image as ImageIcon,
	Plus,
	Search,
	Check,
	QrCode,
	Upload,
	Trash2,
	Settings2,
	AlignLeft,
	Book,
	ChevronDown,
} from "lucide-react";
import { SlideTheme, OfferingConfig, INITIAL_THEME } from "../types";
import { searchBible, BibleVersion } from "../services/bibleService";

interface EditorProps {
	rawText: string;
	onTextChange: (text: string) => void;
	onThemeChange: (theme: Partial<SlideTheme>) => void;
	currentTheme: SlideTheme;
	offeringConfig: OfferingConfig;
	onOfferingChange: (config: Partial<OfferingConfig>) => void;
}

// Modern, Abstract, Youth-oriented Presets
const PRESET_IMAGES = [
	"/backgrounds/blue-fluid.jpg",
	"/backgrounds/purple-gradient.jpg",
	"/backgrounds/liquid.jpg",
	"/backgrounds/shapes.jpg",
	"/backgrounds/earth.jpg",
	"/backgrounds/mountains.jpg",
	"/backgrounds/ocean-waves.jpg",
	"/backgrounds/aurora.jpg",
	"/backgrounds/galaxy.jpg",
	"/backgrounds/city-night.jpg",
];

const PRESET_GRADIENTS = [
	{ name: "Carbon", value: "#09090b" },
	{
		name: "Deep Blue",
		value: "linear-gradient(to bottom right, #0f172a, #1e1b4b)",
	},
	{
		name: "Violet",
		value: "linear-gradient(to bottom right, #2e1065, #4c1d95)",
	},
	{
		name: "Cyber",
		value: "linear-gradient(to bottom right, #020617, #0e7490)",
	},
	{
		name: "Sunset",
		value: "linear-gradient(to bottom right, #4a044e, #b91c1c)",
	},
	{
		name: "Forest",
		value: "linear-gradient(to bottom right, #022c22, #047857)",
	},
	{
		name: "Midnight",
		value: "linear-gradient(to bottom right, #0b132b, #1c2541)",
	},
	{
		name: "Indigo Glow",
		value: "linear-gradient(to bottom right, #1e1b4b, #6366f1)",
	},
	{
		name: "Teal",
		value: "linear-gradient(to bottom right, #0f766e, #134e4a)",
	},
	{
		name: "Crimson",
		value: "linear-gradient(to bottom right, #3f0d12, #a71d31)",
	},
];

const Editor: React.FC<EditorProps> = ({
	rawText,
	onTextChange,
	onThemeChange,
	currentTheme,
	offeringConfig,
	onOfferingChange,
}) => {
	const [activeTab, setActiveTab] = useState<
		"lyrics" | "bible" | "theme" | "offering"
	>("lyrics");

	// Bible State
	const [bibleQuery, setBibleQuery] = useState("");
	const [bibleVersion, setBibleVersion] = useState<BibleVersion>("web");
	const [foundVerse, setFoundVerse] = useState<{
		ref: string;
		text: string;
	} | null>(null);
	const [isLoadingVerse, setIsLoadingVerse] = useState(false);
	const [bibleError, setBibleError] = useState("");

	const handleBibleSearch = async () => {
		if (!bibleQuery.trim()) return;
		setIsLoadingVerse(true);
		setBibleError("");
		setFoundVerse(null);

		try {
			const result = await searchBible(bibleQuery, bibleVersion);
			if (result) {
				setFoundVerse({ ref: result.reference, text: result.text });
			} else {
				setBibleError("Passage not found.");
			}
		} catch (e) {
			setBibleError("Connection error.");
		} finally {
			setIsLoadingVerse(false);
		}
	};

	const addVerseToSlides = () => {
		if (!foundVerse) return;
		const newContent = `${rawText}\n\n${foundVerse.ref}\n${foundVerse.text}`;
		onTextChange(newContent.trim());
		setBibleQuery("");
		setFoundVerse(null);
		setActiveTab("lyrics");
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
		<div className="flex flex-col h-full">
			{/* Modern Pill Tabs */}
			<div className="px-4 py-4 shrink-0">
				<div className="flex p-1 bg-zinc-900/70 backdrop-blur rounded-full border border-white/10">
					{[
						{ id: "lyrics", icon: AlignLeft, label: "Text" },
						{ id: "bible", icon: Book, label: "Bible" },
						{ id: "theme", icon: Settings2, label: "Style" },
						{ id: "offering", icon: QrCode, label: "Give" },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
								activeTab === tab.id
									? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
									: "text-zinc-400 hover:text-zinc-200"
							}`}
						>
							<tab.icon size={14} />
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 flex flex-col min-h-0 relative">
				{/* LYRICS TAB */}
				{activeTab === "lyrics" && (
					<div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-200">
						<div className="px-6 pb-2 flex items-center justify-between">
							<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
								Editor
							</span>
							<button
								onClick={() => {
									if (confirm("Clear all text?")) onTextChange("");
								}}
								className="text-[10px] font-medium text-zinc-600 hover:text-red-400 transition-colors"
							>
								Clear All
							</button>
						</div>

						<textarea
							className="flex-1 w-full bg-transparent text-zinc-100 p-6 border-none focus:ring-0 focus:outline-none resize-none font-sans text-sm leading-7 placeholder-zinc-600 selection:bg-white/10"
							placeholder="Paste lyrics here...&#10;&#10;Use double blank lines to separate slides."
							value={rawText}
							onChange={(e) => onTextChange(e.target.value)}
							spellCheck={false}
						/>
					</div>
				)}

				{/* BIBLE TAB */}
				{activeTab === "bible" && (
					<div className="p-6 space-y-6 overflow-y-auto h-full animate-in slide-in-from-left-4 duration-300 custom-scrollbar">
						<div className="space-y-3">
							<label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
								Scripture Search
							</label>

							<div className="flex gap-2">
								<select
									value={bibleVersion}
									onChange={(e) =>
										setBibleVersion(e.target.value as BibleVersion)
									}
									className="bg-zinc-900/70 backdrop-blur border border-white/10 rounded-xl px-3 text-xs text-zinc-300 focus:outline-none focus:text-white transition-colors"
								>
									<option value="web">WEB</option>
									<option value="kjv">KJV</option>
									<option value="bbe">BBE</option>
								</select>
								<div className="flex-1 relative">
									<input
										type="text"
										value={bibleQuery}
										onChange={(e) => setBibleQuery(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleBibleSearch()}
										placeholder="John 3:16"
										className="w-full bg-zinc-900/70 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-zinc-600"
									/>
								</div>
							</div>

							<button
								onClick={handleBibleSearch}
								disabled={isLoadingVerse}
								className="w-full py-3 bg-zinc-800 hover:bg-white text-zinc-300 hover:text-black rounded-xl flex items-center justify-center transition-all disabled:opacity-50 text-sm font-bold gap-2"
							>
								{isLoadingVerse ? (
									<div className="animate-spin w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full" />
								) : (
									<>
										<Search size={16} /> Search
									</>
								)}
							</button>

							{bibleError && (
								<p className="text-red-400 text-xs mt-2 text-center">
									{bibleError}
								</p>
							)}
						</div>

						{foundVerse && (
							<div className="bg-zinc-900/70 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
								<div>
									<h3 className="text-indigo-400 font-display text-lg font-bold">
										{foundVerse.ref}{" "}
										<span className="text-xs text-zinc-500 ml-2 uppercase">
											{bibleVersion}
										</span>
									</h3>
									<p className="text-zinc-300 mt-2 leading-relaxed text-sm opacity-80 font-serif italic">
										"{foundVerse.text}"
									</p>
								</div>
								<button
									onClick={addVerseToSlides}
									className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
								>
									<Plus size={16} />
									Add to Service
								</button>
							</div>
						)}
					</div>
				)}

				{/* THEME TAB */}
				{activeTab === "theme" && (
					<div className="h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
						<div className="p-6 space-y-8">
							{/* Backgrounds */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
										Visuals
									</label>
									<button
										onClick={() => onThemeChange({ ...INITIAL_THEME })}
										className="text-[10px] text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
									>
										Reset
									</button>
								</div>

								<div className="grid grid-cols-3 gap-3">
									{PRESET_IMAGES.map((url, i) => (
										<button
											key={i}
											onClick={() =>
												onThemeChange({ type: "image", value: url })
											}
											className={`group relative aspect-video rounded-xl overflow-hidden transition-all ${
												currentTheme.type === "image" &&
												currentTheme.value === url
													? "ring-2 ring-white scale-[1.02]"
													: "opacity-70 hover:opacity-100"
											}`}
										>
											<img
												src={url}
												alt="background"
												className="w-full h-full object-cover"
											/>
											{currentTheme.type === "image" &&
												currentTheme.value === url && (
													<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
														<Check
															size={20}
															className="text-white drop-shadow-md"
														/>
													</div>
												)}
										</button>
									))}
								</div>

								<label className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 cursor-pointer transition-all backdrop-blur">
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

							{/* Gradients */}
							<div className="space-y-4">
								<label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
									Colors
								</label>
								<div className="grid grid-cols-3 gap-2">
									{PRESET_GRADIENTS.map((preset) => (
										<button
											key={preset.name}
											onClick={() =>
												onThemeChange({ type: "gradient", value: preset.value })
											}
											className={`h-10 rounded-lg transition-all relative ${
												currentTheme.value === preset.value
													? "ring-2 ring-white scale-105"
													: "opacity-80 hover:opacity-100"
											}`}
											style={{ background: preset.value }}
											title={preset.name}
										>
											{currentTheme.value === preset.value && (
												<div className="absolute inset-0 flex items-center justify-center">
													<Check
														size={14}
														className="text-white drop-shadow-md"
													/>
												</div>
											)}
										</button>
									))}
								</div>
							</div>

							{/* Typography Settings */}
							<div className="space-y-6 pt-6 border-t border-white/5">
								{/* Overlay Opacity */}
								<div>
									<label className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
										<span>Dimness</span>
										<span className="text-white">
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
										className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700"
									/>
								</div>

								{/* Font Size */}
								<div>
									<label className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
										<span>Text Scale</span>
										<span className="text-white">
											{(currentTheme.fontSize || 1).toFixed(1)}x
										</span>
									</label>
									<div className="flex items-center gap-3">
										<Type size={12} className="text-zinc-600" />
										<input
											type="range"
											min="0.5"
											max="2.5"
											step="0.1"
											value={currentTheme.fontSize || 1}
											onChange={(e) =>
												onThemeChange({ fontSize: parseFloat(e.target.value) })
											}
											className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700"
										/>
										<Type size={16} className="text-zinc-300" />
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* OFFERING TAB */}
				{activeTab === "offering" && (
					<div className="p-6 space-y-6 overflow-y-auto h-full animate-in slide-in-from-bottom-4 duration-300 custom-scrollbar">
						<div className="space-y-5">
							<label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-2">
								Giving Screen
							</label>

							<div className="space-y-2">
								<span className="text-[10px] text-zinc-400 uppercase font-bold">
									Header
								</span>
								<input
									type="text"
									value={offeringConfig.title}
									onChange={(e) => onOfferingChange({ title: e.target.value })}
									className="w-full bg-zinc-900/70 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors placeholder-zinc-600"
								/>
							</div>

							<div className="space-y-2">
								<span className="text-[10px] text-zinc-400 uppercase font-bold">
									Subtext
								</span>
								<input
									type="text"
									value={offeringConfig.subTitle}
									onChange={(e) =>
										onOfferingChange({ subTitle: e.target.value })
									}
									className="w-full bg-zinc-900/70 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors placeholder-zinc-600"
								/>
							</div>

							<div className="space-y-2">
								<span className="text-[10px] text-zinc-400 uppercase font-bold">
									QR Code
								</span>

								{/* File Upload */}
								<div className="flex items-center gap-2">
									<label className="flex-1 cursor-pointer bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10 backdrop-blur">
										<Upload size={14} />
										<span>Upload Image</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) =>
												handleFileUpload(e, (url) =>
													onOfferingChange({ qrImageUrl: url })
												)
											}
										/>
									</label>
									{offeringConfig.qrImageUrl && (
										<button
											onClick={() => onOfferingChange({ qrImageUrl: "" })}
											className="p-3 text-zinc-500 hover:text-red-400 bg-zinc-900/70 border border-white/10 rounded-xl transition-colors backdrop-blur"
										>
											<Trash2 size={16} />
										</button>
									)}
								</div>
							</div>
						</div>

						<div className="p-6 bg-zinc-900/70 backdrop-blur rounded-2xl flex flex-col items-center gap-4 text-center border border-white/10">
							<div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-2">
								{offeringConfig.qrImageUrl ? (
									<img
										src={offeringConfig.qrImageUrl}
										alt="QR Preview"
										className="w-full h-full object-contain"
									/>
								) : (
									<QrCode className="text-zinc-300 opacity-20" size={40} />
								)}
							</div>
							<p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
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
