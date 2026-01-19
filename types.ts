
export type OutfitCategory = 'Casual' | 'Business' | 'Night Out';

export interface OutfitSuggestion {
  category: OutfitCategory;
  description: string;
  items: string[];
  stylingTips: string;
}

export interface OutfitGenerationState {
  originalItemDescription: string;
  suggestions: OutfitSuggestion[];
}

export interface GeneratedOutfit {
  category: OutfitCategory;
  imageUrl: string;
  suggestion: OutfitSuggestion;
}
