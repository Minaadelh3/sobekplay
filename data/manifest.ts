
import { PosterItem } from '../types';
import { descriptionMap } from './descriptions';

const posterFilenames = [
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
  "coming_soon.png"
];

const humanize = (filename: string) => {
  const base = filename.split('.')[0];
  const manualMap: Record<string, string> = {
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
    "coming_soon": "Coming Soon"
  };
  
  return manualMap[base] || base.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const posters: PosterItem[] = posterFilenames.map((fname, index) => {
  const title = humanize(fname);
  return {
    id: `p-${index}`,
    src: `/public/assets/posters/${fname}`,
    filename: fname,
    title: title,
    description: descriptionMap[title],
    isOriginal: fname.toLowerCase().includes('sobek') || fname.toLowerCase().includes('teaser'),
    isComingSoon: fname.toLowerCase().includes('soon') || fname.toLowerCase().includes('coming'),
    isClassic: /[\u0600-\u06FF]/.test(title) || fname.includes('classic') || fname.includes('masr') || fname.includes('army') || fname.includes('nil')
  };
});
