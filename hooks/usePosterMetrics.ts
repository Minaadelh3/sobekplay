
import { useState, useEffect } from 'react';
import { PosterItem, PosterMetrics } from '../types';

export const usePosterMetrics = (posters: PosterItem[]) => {
  const [analyzedPosters, setAnalyzedPosters] = useState<PosterItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      // In a real environment, we'd use a canvas here. 
      // For this implementation, we simulate metrics with deterministic logic based on filename hash 
      // so categories stay consistent across sessions but feel dynamic.
      
      const results = posters.map(poster => {
        const hash = poster.filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const brightness = (hash % 100) / 100;
        const contrast = ((hash * 7) % 100) / 100;
        const saturation = ((hash * 13) % 100) / 100;
        const edgeDensity = ((hash * 17) % 100) / 100;
        const hue: 'warm' | 'cool' = hash % 2 === 0 ? 'warm' : 'cool';
        
        const impactScore = (contrast * 0.4) + (saturation * 0.3) + (edgeDensity * 0.3);

        return {
          ...poster,
          metrics: {
            brightness,
            contrast,
            saturation,
            hue,
            edgeDensity,
            impactScore
          }
        };
      });

      setAnalyzedPosters(results);
      setIsAnalyzing(false);
    };

    analyze();
  }, [posters]);

  return { analyzedPosters, isAnalyzing };
};
