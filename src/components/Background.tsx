import * as React from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setLoading } from "../store/backgroundSlice";

export const Background: React.FC = () => {
  const { currentBackground, filters, backgroundType, solidBackground, gradientBackground } = useAppSelector((state) => state.background);
  const dispatch = useAppDispatch();

  // Состояние для двух слоев изображений
  const [primaryImage, setPrimaryImage] = React.useState<string | null>(null);
  const [secondaryImage, setSecondaryImage] = React.useState<string | null>(null);
  const [primaryLoaded, setPrimaryLoaded] = React.useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Создаем CSS фильтр из настроек
  const createFilterString = () => {
    return [
      `blur(${filters.blur}px)`,
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturate}%)`,
      `hue-rotate(${filters.hueRotate}deg)`,
      `sepia(${filters.sepia}%)`,
      `grayscale(${filters.grayscale}%)`,
      `invert(${filters.invert}%)`,
      `opacity(${filters.opacity}%)`
    ].join(' ');
  };

  // Вычисляем масштаб для компенсации размытия
  const getScaleForBlur = () => {
    // Увеличиваем изображение на 1% за каждый пиксель размытия
    return 1 + (filters.blur * 0.01);
  };

  // Создаем CSS для градиента
  const createGradientCSS = () => {
    const { type, colors, direction, position } = gradientBackground;
    if (type === 'linear') {
      return `linear-gradient(${direction || 'to right'}, ${colors.join(', ')})`;
    } else {
      return `radial-gradient(circle at ${position || 'center'}, ${colors.join(', ')})`;
    }
  };

  // Определяем стиль фона в зависимости от типа
  const getBackgroundStyle = () => {
    switch (backgroundType) {
      case 'solid':
        return {
          backgroundColor: solidBackground.color,
          backgroundImage: 'none'
        };
      case 'gradient':
        return {
          backgroundImage: createGradientCSS(),
          backgroundColor: 'transparent'
        };
      case 'image':
      default:
        return {
          backgroundImage: currentBackground ? `url(${currentBackground})` : "none",
          backgroundColor: 'transparent'
        };
    }
  };

  // Отслеживаем изменения фона для анимации
  React.useEffect(() => {
    if (backgroundType === 'image' && currentBackground) {
      // Если это первое изображение
      if (!primaryImage) {
        setPrimaryImage(currentBackground);
        setPrimaryLoaded(false);
        dispatch(setLoading(true));
      }
      // Если изображение изменилось
      else if (currentBackground !== primaryImage) {
        setIsTransitioning(true);
        setSecondaryImage(currentBackground);
        setSecondaryLoaded(false);
        dispatch(setLoading(true));
      }
    }
  }, [currentBackground, backgroundType, primaryImage, dispatch]);

  // Обработчики для основного изображения
  const handlePrimaryLoad = () => {
    setPrimaryLoaded(true);
    dispatch(setLoading(false));
  };

  const handlePrimaryError = () => {
    setPrimaryLoaded(false);
    dispatch(setLoading(false));
  };

  // Обработчики для вторичного изображения
  const handleSecondaryLoad = () => {
    setSecondaryLoaded(true);
    dispatch(setLoading(false));
    // Ждем завершения полной анимации crossfade (800ms) перед переключением
    setTimeout(() => {
      // Меняем местами изображения
      setPrimaryImage(secondaryImage);
      setPrimaryLoaded(true);
      setSecondaryImage(null);
      setSecondaryLoaded(false);
      setIsTransitioning(false);
    }, 800); // Ждем полного завершения анимации
  };

  const handleSecondaryError = () => {
    setSecondaryLoaded(false);
    setSecondaryImage(null);
    setIsTransitioning(false);
  };

  // Показываем фон только если есть изображение или выбран другой тип фона
  if (backgroundType === 'image' && !currentBackground) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        overflow: "hidden",
        filter: createFilterString(),
        transform: `scale(${getScaleForBlur()})`,
        ...getBackgroundStyle(),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Основное изображение (всегда видимое) */}
      {backgroundType === 'image' && primaryImage && (
        <img
          src={primaryImage}
          alt="Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isTransitioning && secondaryLoaded ? 0 : 1,
            transition: "opacity 0.8s ease-in-out",
            zIndex: 1
          }}
          onLoad={handlePrimaryLoad}
          onError={handlePrimaryError}
        />
      )}

      {/* Вторичное изображение (для переходов) */}
      {backgroundType === 'image' && secondaryImage && isTransitioning && (
        <img
          src={secondaryImage}
          alt="New Background"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: secondaryLoaded ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
            zIndex: 2
          }}
          onLoad={handleSecondaryLoad}
          onError={handleSecondaryError}
        />
      )}





      {/* Сообщение об ошибке */}
      {false && (
        <Flex
          align="center"
          justify="center"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Flex direction="column" align="center" gap="3">
            <Text size="4" weight="bold" color="red">
              Ошибка загрузки
            </Text>
            <Text size="3" color="gray" style={{ textAlign: "center" }}>
              Не удалось загрузить фоновое изображение
            </Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

// Добавляем CSS анимацию для спиннера
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
