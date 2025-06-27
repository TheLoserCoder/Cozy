import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { getFontOption, applyFontToDocument } from '../data/fonts';

export const useFontLoader = () => {
  const { font } = useAppSelector((state) => state.theme);

  useEffect(() => {
    const fontOption = getFontOption(font.fontFamily);
    applyFontToDocument(fontOption);
  }, [font.fontFamily]);
};
