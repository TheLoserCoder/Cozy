import * as React from "react";
import { Theme, ThemeProps } from "@radix-ui/themes";
import { useAppSelector } from "../store/hooks";
import "@radix-ui/themes/styles.css";

export const AppThemeProvider: React.FC<React.PropsWithChildren<Partial<ThemeProps>>> = ({ children, ...props }) => {
  const { colors, radixTheme } = useAppSelector((state) => state.theme);

  // Применяем кастомные CSS переменные для цветов
  React.useEffect(() => {
    const root = document.documentElement;

    // Кастомные переменные
    root.style.setProperty('--custom-accent-color', colors.accent);
    root.style.setProperty('--custom-links-color', colors.links);
    root.style.setProperty('--custom-clock-color', colors.clock);
  }, [colors]);

  return (
    <Theme
      accentColor={radixTheme as any}
      grayColor="sage"
      panelBackground="solid"
      scaling="100%"
      radius="full"
      appearance="light"
      {...props}
    >
      {children}
    </Theme>
  );
};
