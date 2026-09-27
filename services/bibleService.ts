export interface BibleVerse {
  reference: string;
  text: string;
  verse: number;
  chapter: number;
  bookName: string;
}

export type BibleVersion = "web" | "kjv" | "bbe";

export interface BibleChapter {
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

export const searchBible = async (
  query: string,
  version: BibleVersion = "web"
): Promise<BibleVerse | null> => {
  const chapter = await fetchChapter(query, version);
  return chapter?.verses[0] ?? null;
};

export const fetchChapter = async (
  query: string,
  version: BibleVersion = "web"
): Promise<BibleChapter | null> => {
  const response = await fetch(
    `https://bible-api.com/${encodeURIComponent(query)}?translation=${version}`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const verses = Array.isArray(data.verses) ? data.verses : [];
  if (verses.length === 0 && data.text) {
    verses.push({
      book_name: data.reference,
      chapter: 1,
      verse: 1,
      text: data.text,
    });
  }

  if (verses.length === 0) {
    return null;
  }

  const mapped: BibleVerse[] = verses.map((item: {
    book_name?: string;
    chapter?: number;
    verse?: number;
    text?: string;
  }) => ({
    bookName: item.book_name || "",
    chapter: Number(item.chapter) || 1,
    verse: Number(item.verse) || 1,
    reference: `${item.book_name} ${item.chapter}:${item.verse}`,
    text: String(item.text || "").trim(),
  }));

  return {
    bookName: mapped[0].bookName,
    chapter: mapped[0].chapter,
    verses: mapped,
  };
};
