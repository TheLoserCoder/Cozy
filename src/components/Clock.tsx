import * as React from "react";
import { Text, Heading, Box } from "@radix-ui/themes";
import { useAppSelector } from "../store/hooks";
import { createLinkColorFromAccent, isValidHexColor } from "../utils/colorUtils";

export const Clock: React.FC = () => {
  const [time, setTime] = React.useState<Date>(new Date());
  const { clock, language, radixTheme } = useAppSelector((state) => state.theme);

  // Определяем цвет часов: настроенный цвет или fallback к производному от акцентного
  const clockColor = clock.color || (isValidHexColor(radixTheme) ? createLinkColorFromAccent(radixTheme) : radixTheme);

  React.useEffect(() => {
    if (!clock.enabled) return;

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [clock.enabled]);

  // Получаем правильную локаль для форматирования времени
  const getLocale = (languageCode: string): string => {
    const localeMap: Record<string, string> = {
      'ru': 'ru-RU',
      'en': 'en-US',
      'de': 'de-DE',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'cs': 'cs-CZ',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
    };
    return localeMap[languageCode] || 'en-US';
  };

  const currentLocale = getLocale(language);

  const formattedTime = time.toLocaleTimeString(currentLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: clock.showSeconds ? "2-digit" : undefined,
    hour12: false,
  });

  // Если часы отключены, не отображаем их
  if (!clock.enabled) {
    return null;
  }

  // Вычисляем смещение вверх для больших размеров часов
  const getVerticalOffset = (size: number) => {
    if (size >= 2.0) {
      // При размере 200% и больше смещаем вверх
      const offsetFactor = (size - 2.0) * 60; // 60px смещения на каждые 0.1 увеличения размера
      return -offsetFactor;
    }
    return 0;
  };

  const verticalOffset = getVerticalOffset(clock.size);

  return (
    <Box
      className="clock-component"
      mb="6"
      p="4"
      style={{
        textAlign: "center",
        transform: `scale(${clock.size}) translateY(${verticalOffset}px)`,
        transformOrigin: "center",
        transition: "transform 0.3s ease"
      }}
    >
      <Heading
        size="9"
        mb={clock.showDate ? "3" : "0"}
        style={{
          fontSize: "4rem",
          fontWeight: "700",
          letterSpacing: "-0.02em",
          color: clockColor,
          transition: "all 0.3s ease",
          fontFamily: "var(--app-font-family, inherit)"
        }}
      >
        {formattedTime}
      </Heading>
      {clock.showDate && (
        <Text
          size="4"
          style={{
            fontSize: "1.2rem",
            fontWeight: "400",
            color: clockColor,
            opacity: 0.8,
            transition: "all 0.3s ease",
            fontFamily: "var(--app-font-family, inherit)"
          }}
        >
          {time.toLocaleDateString(currentLocale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      )}
    </Box>
  );
};
