
export interface PosterMetrics {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: 'warm' | 'cool';
  edgeDensity: number;
  impactScore: number;
}

export interface PosterItem {
  id: string;
  src: string;
  filename: string;
  title: string;
  description?: string;
  metrics?: PosterMetrics;
  isOriginal?: boolean;
  isComingSoon?: boolean;
  isClassic?: boolean;
  type?: 'movie' | 'series';
  // Admin Overrides
  isHidden?: boolean;
  customTitle?: string;
  customDescription?: string;
  isFeatured?: boolean;
  tags?: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  content: string; // Changed from body to content to match hook
  icon: string;    // Added icon
  date?: any;      // Made optional/any for Firestore timestamp
  order?: number;  // Added order
  image?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

export interface SiteConfig {
  UPLOAD_FOLDER_URL: string;
  WHATSAPP_JOIN_URL: string;
  OPTIONAL_AUDIO_PATH: string;
}
