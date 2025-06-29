import * as React from "react";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setRadixTheme, resetAllColorsToAccent, updateLinkedColors } from "../store/themeSlice";
import { setListBackgroundColor, setListTitleColor, setListSeparatorColor, setListBorderColor } from "../store/themeSlice";
import { resetAllFastLinkIndividualColors } from "../store/fastLinksSlice";
import { resetAllCustomColors } from "../store/listsSlice";
import { getColorPalettes, createAllColorPalettes, ColorAnalysisMode } from "../utils/colorAnalysis";

interface AutoColorButtonProps {
  size?: "1" | "2" | "3" | "4";
}

// Массив режимов для циклического переключения (8 вариантов)
const COLOR_MODES = [
  ColorAnalysisMode.HARMONIOUS,
  ColorAnalysisMode.CONTRASTING,
  ColorAnalysisMode.VIBRANT,
  ColorAnalysisMode.MUTED,
  ColorAnalysisMode.WARM,
  ColorAnalysisMode.COOL,
  ColorAnalysisMode.MONOCHROME,
  ColorAnalysisMode.COMPLEMENTARY
];

// Названия режимов для tooltip
const MODE_NAMES = {
  [ColorAnalysisMode.HARMONIOUS]: 'Гармоничные цвета',
  [ColorAnalysisMode.CONTRASTING]: 'Контрастные цвета',
  [ColorAnalysisMode.VIBRANT]: 'Яркие цвета',
  [ColorAnalysisMode.MUTED]: 'Приглушенные цвета',
  [ColorAnalysisMode.WARM]: 'Теплые оттенки',
  [ColorAnalysisMode.COOL]: 'Холодные оттенки',
  [ColorAnalysisMode.MONOCHROME]: 'Монохромные цвета',
  [ColorAnalysisMode.COMPLEMENTARY]: 'Комплементарные цвета'
};

export const AutoColorButton: React.FC<AutoColorButtonProps> = ({ size = "2" }) => {
  const dispatch = useAppDispatch();
  const { currentBackground, images, backgroundType, solidBackground, gradientBackground } = useAppSelector((state) => state.background);
  const { lists } = useAppSelector((state) => state.theme);

  // Получаем URL текущего изображения по ID
  const currentImageUrl = React.useMemo(() => {
    if (!currentBackground || backgroundType !== 'image') return null;
    const currentImage = images.find(img => img.id === currentBackground);
    return currentImage?.url || null;
  }, [currentBackground, images, backgroundType]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentModeIndex, setCurrentModeIndex] = React.useState(0);
  const [cachedPalettes, setCachedPalettes] = React.useState<any[]>([]);
  const [lastAnalyzedSource, setLastAnalyzedSource] = React.useState<string>('');

  // Функция для получения цветов из любого типа фона
  const getColorsFromBackground = async () => {
    switch (backgroundType) {
      case 'image':
        if (!currentImageUrl) return null;
        return await getColorPalettes(currentImageUrl, lists.backdropBlur);

      case 'solid':
        // Создаем палитры на основе одного цвета
        const solidColor = solidBackground.color;
        // Преобразуем hex в RGB
        const r = parseInt(solidColor.slice(1, 3), 16);
        const g = parseInt(solidColor.slice(3, 5), 16);
        const b = parseInt(solidColor.slice(5, 7), 16);
        const dominantColors = [{ r, g, b }];
        return createAllColorPalettes(dominantColors, lists.backdropBlur);

      case 'gradient':
        // Используем первый цвет градиента как основной
        const gradientColor = gradientBackground.colors[0];
        const gr = parseInt(gradientColor.slice(1, 3), 16);
        const gg = parseInt(gradientColor.slice(3, 5), 16);
        const gb = parseInt(gradientColor.slice(5, 7), 16);
        const gradientDominantColors = [{ r: gr, g: gg, b: gb }];
        return createAllColorPalettes(gradientDominantColors, lists.backdropBlur);

      default:
        return null;
    }
  };

  const handleAutoColor = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Создаем уникальный ключ для текущего фона
      const currentSource = `${backgroundType}-${backgroundType === 'image' ? currentImageUrl :
        backgroundType === 'solid' ? solidBackground.color :
        gradientBackground.colors.join(',')}-${lists.backdropBlur}`;

      let palettesToUse = cachedPalettes;
      let modeIndexToUse = currentModeIndex;

      // Проверяем, нужно ли заново анализировать фон
      if (lastAnalyzedSource !== currentSource || cachedPalettes.length === 0) {
        console.log('Getting color palettes for background:', backgroundType, currentSource);

        // Получаем все палитры для текущего типа фона
        const allPalettes = await getColorsFromBackground();
        if (!allPalettes) {
          console.warn('Failed to get color palettes');
          return;
        }
        console.log('Got all palettes:', allPalettes);

        // Кэшируем палитры в компоненте
        setCachedPalettes(allPalettes);
        setLastAnalyzedSource(currentSource);

        // Используем новые палитры и сбрасываем индекс
        palettesToUse = allPalettes;
        modeIndexToUse = 0;
        setCurrentModeIndex(0);
      }

      // Получаем текущую палитру
      const currentPalette = palettesToUse[modeIndexToUse];
      const currentMode = COLOR_MODES[modeIndexToUse];

      if (currentPalette) {
        console.log('Applying palette with mode:', currentMode, currentPalette);

        // Сначала сбрасываем все цвета к акцентному
        dispatch(resetAllColorsToAccent());
        // Сбрасываем индивидуальные цвета списков
        dispatch(resetAllCustomColors());
        // Сбрасываем индивидуальные цвета быстрых ссылок
        dispatch(resetAllFastLinkIndividualColors());

        // Затем применяем новые цвета
        dispatch(setRadixTheme(currentPalette.accent));
        // НЕ устанавливаем цвет часов - пусть они используют производный от акцентного

        // Применяем цвета только для списков
        dispatch(setListBackgroundColor(currentPalette.listBackground));

        // Обновляем связанные цвета на основе нового акцентного цвета
        dispatch(updateLinkedColors());

        // Очищаем остальные цветовые настройки чтобы использовался акцентный цвет
        dispatch(setListTitleColor(''));
        dispatch(setListSeparatorColor(''));
        dispatch(setListBorderColor(''));

        console.log('Colors applied successfully with mode:', currentMode);
      }

      // Переходим к следующему режиму (только если не было нового анализа)
      if (lastAnalyzedSource === currentSource && cachedPalettes.length > 0) {
        const nextModeIndex = (currentModeIndex + 1) % COLOR_MODES.length;
        setCurrentModeIndex(nextModeIndex);
      } else {
        // Если был новый анализ, следующий раз будет режим 1
        setCurrentModeIndex(1);
      }

    } catch (error) {
      console.error('Error analyzing image:', error);

      // Fallback - применяем стандартную палитру
      const fallbackAccent = '#3E63DD';
      dispatch(setRadixTheme(fallbackAccent));
      // НЕ устанавливаем цвет часов - пусть они используют производный от акцентного
      dispatch(setListBackgroundColor(lists.backdropBlur ? 'rgba(255, 255, 255, 0.1)' : '#F8F9FA'));

      // Обновляем связанные цвета на основе fallback акцентного цвета
      dispatch(updateLinkedColors());

      // Очищаем остальные цветовые настройки чтобы использовался акцентный цвет
      dispatch(setListTitleColor(''));
      dispatch(setListSeparatorColor(''));
      dispatch(setListBorderColor(''));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentMode = COLOR_MODES[currentModeIndex];
  const nextMode = COLOR_MODES[(currentModeIndex + 1) % COLOR_MODES.length];

  return (
    <Tooltip content={
      isAnalyzing
        ? `Анализ изображения (${MODE_NAMES[currentMode]})...`
        : `Генерация цвета на основе изображения: ${MODE_NAMES[nextMode]}`
    }>
      <IconButton
        variant="soft"
        size={size}
        type="button"
        onClick={handleAutoColor}
        disabled={isAnalyzing}
        style={{
          cursor: isAnalyzing ? 'wait' : 'pointer',
          opacity: 1,
          background: `linear-gradient(217deg, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0) 70.71%),
                      linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%),
                      linear-gradient(336deg, rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0) 70.71%)`,
          border: 'none'
        }}
      >
        <MagicWandIcon
          style={{
            color: 'white',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
            animation: isAnalyzing ? 'spin 1s linear infinite' : 'none'
          }}
        />
      </IconButton>
    </Tooltip>
  );
};

// Добавляем CSS анимацию только для вращения при анализе
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.head.querySelector('style[data-auto-color-animations]')) {
    style.setAttribute('data-auto-color-animations', 'true');
    document.head.appendChild(style);
  }
}
