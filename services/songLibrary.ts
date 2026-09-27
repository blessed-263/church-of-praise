export interface Song {
  title: string;
  lyrics: string;
}

export const SONG_LIBRARY: Song[] = [
  {
    title: "Everybody Praise The Lord Now",
    lyrics: `EVERYBODY PRAISE THE LORD NOW

Verse 1:
Everybody praise the Lord now,
I will praise Him every day,
Praise the Lord now,
I will praise the Lord

Chorus:
Jehovah,
Jeho... Jeho.... Jeho...
Jeho! Jehovah!!

Verse 2:
Everybody blow your trumpet
Para rararara
Blow your trumpet
Parararara`,
  },
  {
    title: "Jehovah Eh",
    lyrics: `JEHOVAH EH

Chorus:
Jehovah eh eh
Jehovah ah ah
Jehovah eh eh
Jehovah ah ah
Jehovah eh eh
Jehovah ah ah
Jehovah eh eh
Jehovah ah ah

Verse:
Jehovah
You are the most high
You are the most high God
You are the most high
You are the most high God
You are the most high
You are the most high God
You are the most high
You are the most high God
You are the most high
You are the most high God`,
  },
  {
    title: "Give Me Oil In My Lamp",
    lyrics: `GIVE ME OIL IN MY LAMP

Ah, ah-ah (ah, ah-ah, eh)
Ah-eh, ah-ah (ah-eh, ah-ah, eh)
Ah, ah-ah (ah, ah-ah, eh)
Ah-eh, ah-ah (ah-eh, ah-ah, eh),

Ah, ah-ah (ah, ah-ah, eh)
Ah-eh, ah-ah (ah-eh, ah-ah, eh)
(Ah, ah-ah, eh)
Ah-eh, ah-ah (ah-eh, ah-ah, eh)

Give me oil in my lamp
May my light never be dim
Keep me burning, keep me burning
Until the coming of the King, ay

Give me oil in my lamp, Lord
May my light never be dim
Keep me burning, keep me burning
Until the coming of the King

Give me oil in my lamp (give me oil in my lamp)
May my light never be dim (may my light never be dim)
Keep me burning, keep me burning (keep me burning, keep me burning)
'Til the coming of the King (until the coming of the King)

Give me oil in my lamp, Lord (give me oil in my lamp)
May my light never be dim (may my light never be dim)
(Keep me burnin', keep me burning)
'Til the coming of the King ('til the coming of the King)

Everybody sing`,
  },
  {
    title: "Worthy of it All",
    lyrics: `WORTHY OF IT ALL

Verse 1:
All the saints and angels, they bow before Your throne
All the elders cast their crowns before the Lamb of God and sing

Chorus:
You are worthy of it all
You are worthy of it all, Jesus
For from You are all things
And to You are all things
You deserve the glory

Post-Chorus:
Singing oh-ooh, oh-ooh, oooh-ooh-oh
Oh-ooh, oooh-ooh-oh-ooh
Oh-ooh, oh-ooh, oooh
Oh-ooh-ooh, oh-ooh, oh-oooh-ooh

Verse 2:
All the saints and angels, they bow before Your throne
All the elders cast their crowns before the Lamb of God and sing

Chorus:
You are worthy of it all
You are worthy of it all, Jesus
For from You are all things
And to You are all things
You deserve the glory!

Bridge:
Day and night, night and day, let incense arise
Day and night, night and day, let incense arise!
Day and night, night and day, let incense arise!
Day and night, night and day, let incense arise!

Chorus:
You are worthy of it all
You are worthy of it all
For from You are all things
And to You are all things
You deserve the glory!`,
  },
  {
    title: "Way Maker",
    lyrics: `WAY MAKER

Verse 1:
You are here moving in our midst
I worship You I worship You
You are here working in this place
I worship You I worship You

Chorus:
Way Maker, Miracle Worker, Promise Keeper
Light in the darkness my God that is who You are`,
  },
];

export function findSong(text: string): Song | undefined {
  const normalized = text.trim();
  if (!normalized) return undefined;
  return SONG_LIBRARY.find((song) => song.lyrics.trim() === normalized);
}

export function lyricSlides(lyrics: string): string[] {
  return lyrics
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
