
import { PosterItem } from '../types';
import { descriptionMap } from './descriptions';

// ============================================================================
// POSTER CONFIGURATION
// ============================================================================
// 1. Ensure a folder exists at: public/posters/
// 2. Place all the images listed below into that folder.
// 3. The app will automatically serve them from /posters/<filename>
// ============================================================================

const filenames = [
  "sobek_universe_cover.png", // New Cover Photo (3968x1152)
  "bakkar.png", 
  "crocodile_gangster.png", 
  "grand_hotel.png", 
  "harry_potter_vs_sobek.png",
  "la_casa_de.png", 
  "lord_of_rings.png", 
  "niles_shadow.png", 
  "nubanji_coming_soon.png",
  "sobbek_and_harry_potter.png", 
  "sobek_cleopatra.png", 
  "sobek_harry_potter_lower.png",
  "sobek_lost_jungle.png", 
  "sobek_secret_eye.png", 
  "sobek_future.png", 
  "sobek_main_movie.png",
  "sobek_play_teaser.png", 
  "sobek_aswan_affair.png", 
  "sobek_the_god.png", 
  "sobek_nile_god.png",
  "sobek_sorcerer.png", 
  "sobek_nile_friends.png", 
  "ismail_yassin_army.png", 
  "el_khaleya.png",
  "el_sada_el_afadel.png", 
  "project_x.png", 
  "ayam_faggala.png", 
  "siko_siko.png",
  "aros_el_nil.png", 
  "el_mamar.png", 
  "kira_wal_gin.png",
  "coming_soon.png",
  "blue_elephant.png",
  "the_choice.png",
  "diamond_dust.png",
  "welad_rizk.png",
  "ibrahim_labyad.png",
  "sobek_return.png",
  "guardians_nile.png",
  "cairo_30.png",
  "yacoubian_building.png",
  "paranormal.png"
];

const humanize = (filename: string): string => {
  const base = filename.replace(/\.[^/.]+$/, ""); // Remove extension
  
  const manualMap: Record<string, string> = {
    "sobek_universe_cover": "Sobek Universe",
    "bakkar": "مسلسل بكار",
    "ismail_yassin_army": "اسماعيل ياسين فى الجيش",
    "el_khaleya": "الخلية",
    "el_sada_el_afadel": "السادة الافاضل",
    "project_x": "المشروع x",
    "ayam_faggala": "ايام فى الفجالة",
    "siko_siko": "سيكو سيكو",
    "aros_el_nil": "عروس النيل",
    "el_mamar": "فيلم الممر",
    "kira_wal_gin": "كيرة والجن",
    "crocodile_gangster": "Crocodile Gangster",
    "grand_hotel": "Grand Hotel",
    "harry_potter_vs_sobek": "Harry potter VS Sobek",
    "la_casa_de": "La casa de",
    "lord_of_rings": "Lord of Rings",
    "niles_shadow": "Nile's Shadow",
    "nubanji_coming_soon": "Nubanji Coming soon",
    "sobbek_and_harry_potter": "Sobbek and Harry Potter",
    "sobek_cleopatra": "Sobek & Cleopatra",
    "sobek_harry_potter_lower": "Sobek and harry potter",
    "sobek_lost_jungle": "Sobek and the lost jungle",
    "sobek_secret_eye": "Sobek and the secret eye",
    "sobek_future": "Sobek in the future",
    "sobek_main_movie": "Sobek Main Movie",
    "sobek_play_teaser": "Sobek Play teaser",
    "sobek_aswan_affair": "Sobek The aswan affair",
    "sobek_the_god": "Sobek The God",
    "sobek_nile_god": "Sobek the nile God",
    "sobek_sorcerer": "Sobek the sorcerer",
    "sobek_nile_friends": "Sobek's Nile Friends",
    "coming_soon": "Coming Soon",
    "blue_elephant": "Blue Elephant",
    "the_choice": "The Choice",
    "diamond_dust": "Diamond Dust",
    "welad_rizk": "Welad Rizk",
    "ibrahim_labyad": "Ibrahim Labyad",
    "sobek_return": "Sobek's Return",
    "guardians_nile": "Guardians of the Nile",
    "cairo_30": "Cairo 30",
    "yacoubian_building": "The Yacoubian Building",
    "paranormal": "Paranormal"
  };

  if (manualMap[base]) return manualMap[base];

  // Default humanize logic: replace underscores with spaces and capitalize
  return base.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const determineType = (filename: string): 'movie' | 'series' => {
  const lower = filename.toLowerCase();
  if (lower.includes('bakkar') || 
      lower.includes('grand_hotel') || 
      lower.includes('series') || 
      lower.includes('mosalsal') || 
      lower.includes('la_casa') ||
      lower.includes('the_choice') ||
      lower.includes('paranormal')) {
    return 'series';
  }
  return 'movie';
};

export const posters: PosterItem[] = filenames.map((filename) => {
  const title = humanize(filename);
  
  return {
    id: filename.replace(/\.[^/.]+$/, ""),
    // IMPORTANT: In Vite, files in public/posters are served at /posters/
    src: `/posters/${filename}`,
    filename: filename,
    title: title,
    description: descriptionMap[title] || "Experience the journey along the Nile.",
    type: determineType(filename),
    isOriginal: filename.toLowerCase().includes('sobek') || filename.toLowerCase().includes('teaser') || filename.toLowerCase().includes('return') || filename.toLowerCase().includes('guardians') || filename.includes('universe'),
    isComingSoon: filename.toLowerCase().includes('soon') || filename.toLowerCase().includes('coming'),
    isClassic: /[\u0600-\u06FF]/.test(title) || filename.includes('classic') || filename.includes('masr') || filename.includes('army') || filename.includes('nil') || filename.includes('cairo')
  };
});
