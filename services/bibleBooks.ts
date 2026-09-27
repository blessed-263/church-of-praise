export type BibleBook = {
  name: string;
  chapters: number;
};

export const BIBLE_BOOKS: BibleBook[] = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

const BOOK_ALIASES: Record<string, string> = {
  gen: "Genesis",
  ge: "Genesis",
  gn: "Genesis",
  ex: "Exodus",
  exo: "Exodus",
  lev: "Leviticus",
  lv: "Leviticus",
  num: "Numbers",
  nu: "Numbers",
  deut: "Deuteronomy",
  dt: "Deuteronomy",
  jos: "Joshua",
  josh: "Joshua",
  jdg: "Judges",
  judg: "Judges",
  ru: "Ruth",
  "1sam": "1 Samuel",
  "1sa": "1 Samuel",
  "2sam": "2 Samuel",
  "2sa": "2 Samuel",
  "1kgs": "1 Kings",
  "1ki": "1 Kings",
  "2kgs": "2 Kings",
  "2ki": "2 Kings",
  "1chr": "1 Chronicles",
  "1ch": "1 Chronicles",
  "2chr": "2 Chronicles",
  "2ch": "2 Chronicles",
  ezr: "Ezra",
  neh: "Nehemiah",
  est: "Esther",
  jb: "Job",
  ps: "Psalms",
  psa: "Psalms",
  psalm: "Psalms",
  psalms: "Psalms",
  prov: "Proverbs",
  pr: "Proverbs",
  ecc: "Ecclesiastes",
  eccl: "Ecclesiastes",
  song: "Song of Solomon",
  sos: "Song of Solomon",
  ss: "Song of Solomon",
  isa: "Isaiah",
  is: "Isaiah",
  jer: "Jeremiah",
  lam: "Lamentations",
  ezek: "Ezekiel",
  eze: "Ezekiel",
  dan: "Daniel",
  da: "Daniel",
  hos: "Hosea",
  jl: "Joel",
  am: "Amos",
  ob: "Obadiah",
  obad: "Obadiah",
  jnh: "Jonah",
  jon: "Jonah",
  mic: "Micah",
  nah: "Nahum",
  hab: "Habakkuk",
  zeph: "Zephaniah",
  hag: "Haggai",
  zech: "Zechariah",
  zec: "Zechariah",
  mal: "Malachi",
  mt: "Matthew",
  matt: "Matthew",
  mk: "Mark",
  mr: "Mark",
  lk: "Luke",
  lu: "Luke",
  jn: "John",
  joh: "John",
  ac: "Acts",
  act: "Acts",
  rom: "Romans",
  ro: "Romans",
  "1cor": "1 Corinthians",
  "1co": "1 Corinthians",
  "2cor": "2 Corinthians",
  "2co": "2 Corinthians",
  gal: "Galatians",
  eph: "Ephesians",
  phil: "Philippians",
  php: "Philippians",
  col: "Colossians",
  "1th": "1 Thessalonians",
  "1thess": "1 Thessalonians",
  "2th": "2 Thessalonians",
  "2thess": "2 Thessalonians",
  "1tim": "1 Timothy",
  "1ti": "1 Timothy",
  "2tim": "2 Timothy",
  "2ti": "2 Timothy",
  tit: "Titus",
  phm: "Philemon",
  heb: "Hebrews",
  jas: "James",
  jam: "James",
  "1pet": "1 Peter",
  "1pe": "1 Peter",
  "2pet": "2 Peter",
  "2pe": "2 Peter",
  "1jn": "1 John",
  "1jo": "1 John",
  "2jn": "2 John",
  "3jn": "3 John",
  jud: "Jude",
  rev: "Revelation",
  re: "Revelation",
};

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/[.]/g, "").replace(/\s+/g, " ").trim();
}

function aliasKey(value: string) {
  return normalizeQuery(value).replace(/\s+/g, "");
}

export type ParsedPassage = {
  book: BibleBook | null;
  chapter: number | null;
  verse: number | null;
};

export function parsePassageQuery(query: string): ParsedPassage {
  const normalized = normalizeQuery(query);
  if (!normalized) return { book: null, chapter: null, verse: null };

  const booksByLength = [...BIBLE_BOOKS].sort((a, b) => b.name.length - a.name.length);
  let matched: BibleBook | null = null;
  let rest = normalized;

  for (const book of booksByLength) {
    const name = normalizeQuery(book.name);
    if (normalized === name || normalized.startsWith(`${name} `) || normalized.startsWith(`${name}:`)) {
      matched = book;
      rest = normalized.slice(name.length).trim().replace(/^[:]+/, "").trim();
      break;
    }
  }

  if (!matched) {
    const aliasEntries = Object.entries(BOOK_ALIASES).sort((a, b) => b[0].length - a[0].length);
    for (const [alias, bookName] of aliasEntries) {
      const aliasNorm = alias.replace(/\s+/g, " ");
      if (
        normalized === aliasNorm ||
        normalized.startsWith(`${aliasNorm} `) ||
        normalized.startsWith(`${aliasNorm}:`)
      ) {
        matched = BIBLE_BOOKS.find((book) => book.name === bookName) || null;
        rest = normalized.slice(aliasNorm.length).trim().replace(/^[:]+/, "").trim();
        break;
      }
    }
  }

  if (!matched) return { book: null, chapter: null, verse: null };

  const numbers = rest.match(/(\d+)\s*[:.]?\s*(\d+)?/);
  const chapter = numbers ? Number(numbers[1]) : null;
  const verse = numbers && numbers[2] ? Number(numbers[2]) : null;
  return { book: matched, chapter, verse };
}

export function searchBibleBooks(query: string, limit = 8): BibleBook[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return BIBLE_BOOKS.slice(0, limit);

  const compact = aliasKey(normalized);
  const scored = BIBLE_BOOKS.map((book) => {
    const name = normalizeQuery(book.name);
    const aliasHit = Object.entries(BOOK_ALIASES).some(
      ([alias, bookName]) => bookName === book.name && (alias.startsWith(compact) || compact.startsWith(alias))
    );
    let score = 0;
    if (name === normalized) score = 100;
    else if (name.startsWith(normalized)) score = 80;
    else if (name.includes(normalized)) score = 50;
    else if (aliasHit) score = 70;
    return { book, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.book);
}

