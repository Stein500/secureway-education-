import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontStyle = 'script' | 'cursive';

interface FontContextType {
  fontStyle: FontStyle;
  toggleFontStyle: () => void;
  setFontStyle: (style: FontStyle) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontStyle, setFontStyleState] = useState<FontStyle>('script');

  useEffect(() => {
    const savedStyle = localStorage.getItem('fontStyle') as FontStyle | null;
    if (savedStyle && (savedStyle === 'script' || savedStyle === 'cursive')) {
      setFontStyleState(savedStyle);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fontStyle', fontStyle);
    
    // Apply font class to body
    document.body.classList.remove('font-script', 'font-cursive');
    document.body.classList.add(`font-${fontStyle}`);
  }, [fontStyle]);

  const toggleFontStyle = () => {
    setFontStyleState(prev => prev === 'script' ? 'cursive' : 'script');
  };

  const setFontStyle = (style: FontStyle) => {
    setFontStyleState(style);
  };

  return (
    <FontContext.Provider value={{ fontStyle, toggleFontStyle, setFontStyle }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) throw new Error('useFont must be used within FontProvider');
  return context;
}
