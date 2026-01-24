import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'framer-motion';

const VeoPage: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

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

  const fileToGenericBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateVideo = async () => {
    if (!imageFile) return;
    setLoading(true);
    setVideoUrl(null);
    setStatus('Initializing generation...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imageBase64 = await fileToGenericBase64(imageFile);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this image cinematographically',
        image: {
          imageBytes: imageBase64,
          mimeType: imageFile.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio,
        }
      });

      setStatus('Generating video (this may take a minute)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        setStatus('Downloading video...');
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('Complete');
      } else {
        setStatus('Failed to generate video.');
      }
    } catch (e: any) {
        if (e.message && e.message.includes("Requested entity was not found")) {
            setHasKey(false);
            setStatus("Session expired. Please select API key again.");
        } else {
            console.error(e);
            setStatus(`Error: ${e.message || 'Unknown error'}`);
        }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-nearblack pt-32 px-6 flex flex-col items-center text-center justify-center">
        <h1 className="text-4xl font-black text-white mb-6">Sobek AI Studio: Veo</h1>
        <p className="text-muted mb-8 max-w-lg">
          To generate cinematic videos, you need to connect your Google Cloud Project with a paid billing account.
        </p>
        <button 
          onClick={handleSelectKey}
          className="bg-accent-green text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Select API Key
        </button>
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="mt-4 text-accent-gold underline text-sm">Learn about billing</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Cinematic Animation</h1>
            <p className="text-muted text-xl">Bring your photos to life with Veo 3.1</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-charcoal p-8 rounded-3xl border border-white/5 shadow-2xl">
              <label className="block text-accent-gold font-bold mb-4 uppercase tracking-widest text-xs">1. Upload Source Image</label>
              <div className="relative group">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${imageFile ? 'border-accent-green bg-accent-green/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                    {imageFile ? (
                        <div className="flex items-center justify-center text-white font-medium">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {imageFile.name}
                        </div>
                    ) : (
                        <div className="text-muted">
                            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>Click or Drag Photo Here</span>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="bg-charcoal p-8 rounded-3xl border border-white/5 shadow-2xl">
              <label className="block text-accent-gold font-bold mb-4 uppercase tracking-widest text-xs">2. Animation Prompt (Optional)</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the motion (e.g., camera pan right, slow motion, flags waving, smoke rising)..."
                className="w-full bg-nearblack border border-white/10 rounded-xl p-4 text-white focus:border-accent-green outline-none h-32 resize-none placeholder-white/20"
              />
            </div>

            <div className="bg-charcoal p-8 rounded-3xl border border-white/5 shadow-2xl">
               <label className="block text-accent-gold font-bold mb-4 uppercase tracking-widest text-xs">3. Aspect Ratio</label>
               <div className="flex gap-4">
                 <button 
                   onClick={() => setAspectRatio('16:9')}
                   className={`flex-1 py-4 rounded-xl font-bold transition-all ${aspectRatio === '16:9' ? 'bg-white text-black scale-105 shadow-lg' : 'bg-nearblack text-muted hover:bg-white/5'}`}
                 >
                   Landscape (16:9)
                 </button>
                 <button 
                   onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all ${aspectRatio === '9:16' ? 'bg-white text-black scale-105 shadow-lg' : 'bg-nearblack text-muted hover:bg-white/5'}`}
                 >
                   Portrait (9:16)
                 </button>
               </div>
            </div>

            <button 
              onClick={generateVideo}
              disabled={!imageFile || loading}
              className={`w-full py-5 rounded-2xl font-black text-xl tracking-tight transition-all shadow-xl ${!imageFile || loading ? 'bg-white/10 text-muted cursor-not-allowed' : 'bg-accent-green text-white hover:scale-[1.02] hover:bg-accent-green/90'}`}
            >
              {loading ? 'Generating Cinematic...' : 'Generate Video'}
            </button>
          </div>

          <div className="bg-charcoal rounded-3xl border border-white/5 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden shadow-2xl">
             {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 backdrop-blur-sm px-6 text-center">
                 <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin mb-6"></div>
                 <p className="text-white font-bold text-lg animate-pulse">{status}</p>
                 <p className="text-muted text-sm mt-2">This usually takes about 60 seconds</p>
               </div>
             )}
             
             {videoUrl ? (
               <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
             ) : (
               <div className="text-center p-8 w-full h-full flex flex-col items-center justify-center">
                 {imageFile ? (
                   <div className="relative w-full h-full">
                       <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-contain opacity-50 blur-sm" />
                       <div className="absolute inset-0 flex items-center justify-center">
                           <p className="bg-black/50 px-4 py-2 rounded-full backdrop-blur text-white font-bold">Preview Ready</p>
                       </div>
                   </div>
                 ) : (
                   <div className="text-muted/30 flex flex-col items-center">
                     <svg className="w-24 h-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                     <p className="text-xl font-bold">Video Output</p>
                     <p className="text-sm mt-2">Generated content will appear here</p>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeoPage;