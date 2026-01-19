
import React, { useState, useCallback, useRef } from 'react';
import { analyzeItemAndSuggestOutfits, generateOutfitImage } from './services/geminiService';
import { GeneratedOutfit, OutfitGenerationState } from './types';
import OutfitCard from './components/OutfitCard';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setSelectedImage(base64Data);
      setOutfits([]); // Reset previous results
      processItem(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processItem = async (base64: string, mimeType: string) => {
    setIsProcessing(true);
    setProgressMessage('Analyzing your style pieces...');
    
    try {
      const cleanBase64 = base64.split(',')[1];
      
      // Step 1: Analyze item and get outfit suggestions
      const analysis = await analyzeItemAndSuggestOutfits(cleanBase64, mimeType);
      
      // Step 2: Generate visual images for each suggestion
      const generated: GeneratedOutfit[] = [];
      
      for (let i = 0; i < analysis.suggestions.length; i++) {
        const suggestion = analysis.suggestions[i];
        setProgressMessage(`Visualizing ${suggestion.category} outfit...`);
        const imageUrl = await generateOutfitImage(analysis.originalItemDescription, suggestion);
        generated.push({
          category: suggestion.category,
          imageUrl,
          suggestion
        });
      }

      setOutfits(generated);
    } catch (error) {
      console.error("Error processing item:", error);
      alert("Failed to analyze your item. Please try again with a different photo.");
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  };

  const onUpdateOutfitImage = (index: number, newUrl: string) => {
    setOutfits(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], imageUrl: newUrl };
      return copy;
    });
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20">
      {/* Navigation / Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Virtual Stylist <span className="text-indigo-600">AI</span></span>
          </div>
          
          <button 
            onClick={triggerUpload}
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition-all flex items-center space-x-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload New Item</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* Intro Section */}
        {!selectedImage && !isProcessing && (
          <div className="max-w-2xl mx-auto text-center mt-20">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Transform one piece into <span className="text-indigo-600 italic">endless outfits.</span>
            </h1>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
              Upload a photo of any clothing item—even the tricky ones—and our AI will style it for every occasion with high-end flat-lay visuals.
            </p>
            
            <div 
              onClick={triggerUpload}
              className="group relative cursor-pointer border-2 border-dashed border-slate-200 rounded-3xl p-16 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all bg-white"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-700">Drop your item photo here</p>
                <p className="text-sm text-slate-400 mt-1">PNG, JPG or WebP up to 10MB</p>
              </div>
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Styling your collection...</h2>
              <p className="text-indigo-500 font-medium tracking-widest uppercase text-xs animate-pulse">
                {progressMessage}
              </p>
            </div>
          </div>
        )}

        {/* Results View */}
        {!isProcessing && selectedImage && outfits.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-start gap-8 mb-16">
              <div className="w-full md:w-1/3">
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                  <img src={selectedImage} alt="Uploaded item" className="w-full h-auto rounded-xl shadow-inner" />
                </div>
                <div className="mt-6">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Selected Item</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    We've designed three custom styles around this piece to maximize