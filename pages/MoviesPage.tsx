import React from 'react';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import { PosterItem } from '../types';

interface MoviesPageProps {
  posters: PosterItem[];
}

const MoviesPage: React.FC<MoviesPageProps> = ({ posters }) => {
  const movies = posters.filter(p => {
    if (p.type === 'series') return false;
    const t = p.title.toLowerCase();
    if (t.includes('series') || t.includes('season')) return false;
    return true;
  });

  const trending = movies.slice(0, 10);
  const classics = movies.filter(p => p.isClassic);
  const originals = movies.filter(p => p.isOriginal);
  const action = movies.filter(p => p.metrics && p.metrics.edgeDensity > 0.5);
  const drama = movies.filter(p => p.metrics && p.metrics.hue === 'warm');

  return (
    <div className="pb-24">
      <Hero posters={movies} />
      
      <div className="relative z-20 -mt-24 md:-mt-48 space-y-8">
        <Carousel title="Trending Movies" posters={trending} />
        <Carousel title="Sobek Originals" posters={originals} />
        <Carousel title="Egyptian Classics" posters={classics} />
        <Carousel title="High Octane Action" posters={action} />
        <Carousel title="Drama & Stories" posters={drama} />
      </div>
    </div>
  );
};

export default MoviesPage;