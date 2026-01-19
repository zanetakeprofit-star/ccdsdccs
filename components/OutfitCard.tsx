
import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';
import { editOutfitImage } from '../services/geminiService';

interface OutfitCardProps {
  outfit: GeneratedOutfit;
  onUpdateImage: (newUrl: string) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onUpdateImage }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [localImage, setLocalImage] = useState(outfit.imageUrl);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;

    setIsEditing(true);
    try {
      const updatedImage = await editOutfitImage(localImage, editPrompt);
      setLocalImage(updatedImage);
      onUpdateImage(updatedImage);
      setEditPrompt('');
    } catch (err) {
      console.error("Failed to edit image:", err);
      alert("Something went wrong while editing. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full group transition-all hover:shadow-md">
      {/* Category Badge */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">{outfit.category}</h3>
        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
      </div>

      {/* Image Display */}
      <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {isEditing && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-widest">Updating Style...</span>
          </div>
        )}
        <img 
          src={localImage} 
          alt={`${outfit.category} Outfit`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <div className="mb-4">
          <p className="text-slate-800 font-medium text-sm leading-relaxed">
            {outfit.suggestion.description}
          </p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">The Set</h4>
          <ul className="space-y-1">
            {outfit.suggestion.items.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-500 flex items-start">
                <span className="mr-2 text-indigo-300">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Stylist Tip</h4>
          <p className="text-xs text-slate-500 italic">
            "{outfit.suggestion.stylingTips}"
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <form onSubmit={handleEdit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Edit style (e.g. 'Add retro filter')" 
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            disabled={isEditing}
            className="flex-grow text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          />
          <button 
            type="submit"
            disabled={isEditing || !editPrompt.trim()}
            className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:bg-slate-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OutfitCard;
