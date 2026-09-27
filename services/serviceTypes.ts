import { OfferingConfig, Slide, SlideTheme } from "../types";

export type PersistedService = {
  rawText: string;
  theme: SlideTheme;
  offeringConfig: OfferingConfig;
};

export type LiveSnapshot = {
  theme: SlideTheme;
  isBlackout: boolean;
  isClear: boolean;
  isOffering: boolean;
  offeringConfig: OfferingConfig;
  currentSlideIndex: number;
  computedSlides: Slide[];
};

export const LIVE_CHANNEL = "cop-live";
export const LEGACY_STORAGE_KEY = "church_of_praise_youth_v2";
