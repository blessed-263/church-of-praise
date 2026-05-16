/**
 * This week's sermon – update this file weekly.
 * Use "Add to Slides" in the Sermon tab to load this into the presentation.
 */

export interface SermonCase {
	lineRu: string;
	lineEn: string;
	lineFr: string;
	ref: string;
}

export interface SermonData {
	themeFr: string;
	topicRu: string;
	topicEn: string;
	topicFr: string;
	cases: SermonCase[];
	theses: string[];
}

export const THIS_WEEK_SERMON: SermonData = {
	themeFr: "L'unité dans l'église",
	topicRu: "1 Коринфянам 3:3-11 | Бытие 11:1-9 | Амос 3:3",
	topicEn: "1 Corinthians 3:3-11 | Genesis 11:1-9 | Amos 3:3",
	topicFr: "1 Corinthiens 3:3-11 | Genèse 11:1-9 | Amos 3:3",
	cases: [
		{
			lineRu: "1. Единство — это сверхъестественная сила (1 Коринфянам 3:3-11)",
			lineEn: "1. Unity is a supernatural force (1 Corinthians 3:3-11)",
			lineFr: "1. L'unité est une force surnaturelle (1 Corinthiens 3:3-11)",
			ref: "1 Corinthians 3:3-11",
		},
		{
			lineRu: "2. Единый народ может изменить порядок вещей (Бытие 11:1-9)",
			lineEn: "2. A united people can change the order of things (Genesis 11:1-9)",
			lineFr: "2. Un peuple uni peut changer l'ordre des choses (Genèse 11:1-9)",
			ref: "Genesis 11:1-9",
		},
		{
			lineRu: "3. Единство в видении (Амос 3:3)",
			lineEn: "3. Unity in vision (Amos 3:3)",
			lineFr: "3. L'unité dans la vision (Amos 3:3)",
			ref: "Amos 3:3",
		},
	],
	theses: [],
};

/**
 * Builds slide-ready text (double newlines = slide breaks) for the sermon.
 * App splits long segments into 4-line chunks to fit on screen.
 */
export function buildSermonSlideText(
	verseTexts?: { french?: string; english?: string }[]
): string {
	const s = THIS_WEEK_SERMON;
	const slides: string[] = [];

	// 1) Verses first
	s.cases.forEach((c, i) => {
		let block = `${c.lineRu}\n${c.lineEn}\n${c.lineFr}`;
		const verses = verseTexts?.[i];
		if (verses?.french) block += `\n\n${verses.french}`;
		if (verses?.english) block += `\n\n${verses.english}`;
		slides.push(block);
	});

	// 2) Then theses (each thesis on a separate slide)
	s.theses.forEach((thesis) => {
		slides.push(thesis);
	});

	return slides.join("\n\n");
}
