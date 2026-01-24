
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
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  body: string;
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
