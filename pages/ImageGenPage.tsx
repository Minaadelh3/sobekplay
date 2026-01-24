
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'framer-motion';

const ImageGenPage: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      await checkKey();
    }
  };

  const generateImage = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setImageUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: prompt }]
        },
        config: {
            imageConfig: {
                imageSize: imageSize,
                aspectRatio: '16:9'
            }
        }
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64 = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                setImageUrl(`data:${mimeType};base64,${base64}`);
                foundImage = true;
                break;
            }
        }
      }
      
      if (!foundImage) {
        setError("No image generated. The model might have returned text only.");
      }

    } catch (e: any) {
         if (e.message && e.message.includes("Requested entity was not found")) {
            setHasKey(false);
            setError("Session expired. Please select API key again.");
        } else {
            setError(e.message || "Generation failed");
        }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-nearblack pt-32 px-6 flex flex-col items-center text-center justify-center">
        <h1 className="text-4xl font-black text-white mb-6">Sobek AI Studio: Art</h1>
        <p className="text-muted mb-8 max-w-lg">
          High-quality image generation (Nano Banana Pro) requires a paid API key from Google Cloud.
        </p>
        <button 
          onClick={handleSelectKey}
          className="bg-accent-green text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6">
       <div className="max-w-6xl mx-auto">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Concept Art Generator</h1>
            <p className="text-muted text-xl">Create ultra-high resolution visuals with Gemini 3 Pro</p>
         </motion.div>

         <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-8">
                <div className="bg-charcoal p-6 rounded-3xl border border-white/5">
                    <label className="block text-accent-gold font-bold mb-3 uppercase tracking-widest text-xs">Prompt</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-nearblack border border-white/10 rounded-xl p-4 text-white h-48 focus:border-accent-green outline-none resize-none placeholder-white/20"
                        placeholder="A cinematic shot of an ancient Egyptian temple floating in space, neon lights, cyberpunk aesthetic, 8k resolution..."
                    />
                </div>

                <div className="bg-charcoal p-6 rounded-3xl border border-white/5">
                    <label className="block text-accent-gold font-bold mb-3 uppercase tracking-widest text-xs">Resolution</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['1K', '2K', '4K'] as const).map(size => (
                            <button
                                key={size}
                                onClick={() => setImageSize(size)}
                                className={`py-3 rounded-lg font-bold border transition-all ${imageSize === size ? 'bg-white text-black border-white scale-105' : 'bg-transparent text-muted border-white/10 hover:border-white/30'}`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={generateImage}
                    disabled={!prompt || loading}
                    className={`w-full py-5 rounded-2xl font-black text-xl tracking-tight transition-all shadow-xl ${!prompt || loading ? 'bg-white/10 text-muted' : 'bg-accent-green text-white hover:scale-[1.02] hover:bg-accent-green/90'}`}
                >
                    {loading ? 'Dreaming...' : 'Generate Art'}
                </button>
                {error && <p className="text-red-400 text-sm mt-4 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
            </div>

            <div className="lg:w-2/3 bg-charcoal rounded-3xl border border-white/5 flex items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="animate-spin w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full mb-6"></div>
                        <p className="text-white font-bold animate-pulse">Creating your masterpiece...</p>
                    </div>
                )}
                
                {imageUrl ? (
                    <motion.img 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={imageUrl} 
                        alt="Generated" 
                        className="w-full h-full object-contain" 
                    />
                ) : (
                    <div className="text-center text-muted/30">
                        <svg className="w-32 h-32 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-2xl font-bold">Your imagination awaits</p>
                        <p className="text-sm mt-2">Generated images will appear here</p>
                    </div>
                )}
            </div>
         </div>
       </div>
    </div>
  );
};

export default ImageGenPage;
