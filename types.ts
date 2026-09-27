export interface Slide {
  id: string;
  content: string;
}

export interface OfferingConfig {
  title: string;
  subTitle: string;
  qrImageUrl: string;
}

export interface AppState {
  rawText: string;
  slides: Slide[];
  currentSlideIndex: number;
  isBlackout: boolean;
  isClear: boolean; // Clears text but keeps background
  isOffering: boolean; // Shows Offering Overlay
  offeringConfig: OfferingConfig;
  theme: SlideTheme;
}

export interface SlideTheme {
  type: 'color' | 'image' | 'gradient';
  value: string; // Hex color, Image URL, or CSS gradient
  fontFamily: string;
  overlayOpacity: number;
  fontSize: number; // Scale factor, default 1.0
}

export interface GeminiError {
  message: string;
}

// Default Constants used in App.tsx
export const INITIAL_THEME: SlideTheme = {
  type: 'image',
  value: '/backgrounds/sanctuary-light.jpg',
  fontFamily: '"Fraunces", serif',
  overlayOpacity: 0.18,
  fontSize: 1.0,
};

export const INITIAL_OFFERING: OfferingConfig = {
  title: "Offering",
  subTitle: "Scan to give",
  qrImageUrl: "/giving-qr.png",
};

export const INITIAL_LYRICS = `EVERYBODY PRAISE THE LORD NOW

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
Parararara`;
