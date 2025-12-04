export interface BibleVerse {
  reference: string;
  text: string;
}

export type BibleVersion = 'web' | 'kjv' | 'bbe';

export const searchBible = async (query: string, version: BibleVersion = 'web'): Promise<BibleVerse | null> => {
  try {
    // bible-api.com supports ?translation=
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=${version}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.text) {
      return null;
    }

    return {
      reference: data.reference,
      text: data.text.trim()
    };
  } catch (error) {
    console.error("Bible API Error", error);
    throw new Error("Failed to fetch scripture.");
  }
};