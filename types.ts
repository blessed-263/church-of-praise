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
  value: '/backgrounds/blue-fluid.jpg', // Abstract Blue Fluid (local)
  fontFamily: '"Outfit", sans-serif',
  overlayOpacity: 0.2,
  fontSize: 1.0,
};

export const INITIAL_OFFERING: OfferingConfig = {
  title: "Giving",
  subTitle: "Scan via App or Mobile Banking",
  qrImageUrl: "" // Empty by default
};

export const INITIAL_LYRICS = `Way Maker
Miracle Worker
Promise Keeper
Light in the darkness
My God
That is who You are`;
