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

    // Переопределяем цвет indigo темы Radix согласно официальной документации
    // Добавляем поддержку разных вариантов кнопок
    root.style.setProperty('--my-brand-color', radixTheme);

    // Переопределяем переменные indigo
    root.style.setProperty('--indigo-3', `color-mix(in srgb, var(--my-brand-color) 15%, white)`);
    root.style.setProperty('--indigo-a3', `color-mix(in srgb, var(--my-brand-color) 15%, transparent)`);
    root.style.setProperty('--indigo-4', `color-mix(in srgb, var(--my-brand-color) 20%, white)`);
    root.style.setProperty('--indigo-a4', `color-mix(in srgb, var(--my-brand-color) 20%, transparent)`);
    root.style.setProperty('--indigo-5', `color-mix(in srgb, var(--my-brand-color) 25%, white)`);
    root.style.setProperty('--indigo-a5', `color-mix(in srgb, var(--my-brand-color) 25%, transparent)`);
    root.style.setProperty('--indigo-7', `color-mix(in srgb, var(--my-brand-color) 60%, white)`);
    root.style.setProperty('--indigo-a7', `color-mix(in srgb, var(--my-brand-color) 60%, transparent)`);
    root.style.setProperty('--indigo-8', `color-mix(in srgb, var(--my-brand-color) 80%, white)`);
    root.style.setProperty('--indigo-a8', `color-mix(in srgb, var(--my-brand-color) 80%, transparent)`);
    root.style.setProperty('--indigo-9', `var(--my-brand-color)`);
    root.style.setProperty('--indigo-a9', `var(--my-brand-color)`);
    root.style.setProperty('--indigo-10', `color-mix(in srgb, var(--my-brand-color) 90%, black)`);
    root.style.setProperty('--indigo-a10', `color-mix(in srgb, var(--my-brand-color) 90%, transparent)`);
    root.style.setProperty('--indigo-11', `var(--my-brand-color)`);
    root.style.setProperty('--indigo-a11', `var(--my-brand-color)`);

    // Переопределяем переменные accent-color (используются Radix внутренне)
    root.style.setProperty('--accent-3', `color-mix(in srgb, var(--my-brand-color) 15%, white)`);
    root.style.setProperty('--accent-a3', `color-mix(in srgb, var(--my-brand-color) 15%, transparent)`);
    root.style.setProperty('--accent-4', `color-mix(in srgb, var(--my-brand-color) 20%, white)`);
    root.style.setProperty('--accent-a4', `color-mix(in srgb, var(--my-brand-color) 20%, transparent)`);
    root.style.setProperty('--accent-5', `color-mix(in srgb, var(--my-brand-color) 25%, white)`);
    root.style.setProperty('--accent-a5', `color-mix(in srgb, var(--my-brand-color) 25%, transparent)`);
    root.style.setProperty('--accent-7', `color-mix(in srgb, var(--my-brand-color) 60%, white)`);
    root.style.setProperty('--accent-a7', `color-mix(in srgb, var(--my-brand-color) 60%, transparent)`);
    root.style.setProperty('--accent-8', `color-mix(in srgb, var(--my-brand-color) 80%, white)`);
    root.style.setProperty('--accent-a8', `color-mix(in srgb, var(--my-brand-color) 80%, transparent)`);
    root.style.setProperty('--accent-9', `var(--my-brand-color)`);
    root.style.setProperty('--accent-a9', `var(--my-brand-color)`);
    root.style.setProperty('--accent-10', `color-mix(in srgb, var(--my-brand-color) 90%, black)`);
    root.style.setProperty('--accent-a10', `color-mix(in srgb, var(--my-brand-color) 90%, transparent)`);
    root.style.setProperty('--accent-11', `var(--my-brand-color)`);
    root.style.setProperty('--accent-a11', `var(--my-brand-color)`);

    // Создаем style тег в самом низу head для максимального приоритета
    const styleId = 'radix-theme-override';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      // Добавляем в самый конец head
      document.head.appendChild(styleElement);
    }

    // CSS с максимальным приоритетом
    styleElement.textContent = `
      /* Принудительное переопределение всех цветов Radix */
      .radix-themes {
        --my-brand-color: ${radixTheme} !important;

        /* Переопределяем indigo */
        --indigo-3: color-mix(in srgb, var(--my-brand-color) 15%, white) !important;
        --indigo-a3: color-mix(in srgb, var(--my-brand-color) 15%, transparent) !important;
        --indigo-4: color-mix(in srgb, var(--my-brand-color) 20%, white) !important;
        --indigo-a4: color-mix(in srgb, var(--my-brand-color) 20%, transparent) !important;
        --indigo-5: color-mix(in srgb, var(--my-brand-color) 25%, white) !important;
        --indigo-a5: color-mix(in srgb, var(--my-brand-color) 25%, transparent) !important;
        --indigo-7: color-mix(in srgb, var(--my-brand-color) 60%, white) !important;
        --indigo-a7: color-mix(in srgb, var(--my-brand-color) 60%, transparent) !important;
        --indigo-8: color-mix(in srgb, var(--my-brand-color) 80%, white) !important;
        --indigo-a8: color-mix(in srgb, var(--my-brand-color) 80%, transparent) !important;
        --indigo-9: var(--my-brand-color) !important;
        --indigo-a9: var(--my-brand-color) !important;
        --indigo-10: color-mix(in srgb, var(--my-brand-color) 90%, black) !important;
        --indigo-a10: color-mix(in srgb, var(--my-brand-color) 90%, transparent) !important;
        --indigo-11: var(--my-brand-color) !important;
        --indigo-a11: var(--my-brand-color) !important;

        /* Переопределяем accent */
        --accent-3: color-mix(in srgb, var(--my-brand-color) 15%, white) !important;
        --accent-a3: color-mix(in srgb, var(--my-brand-color) 15%, transparent) !important;
        --accent-4: color-mix(in srgb, var(--my-brand-color) 20%, white) !important;
        --accent-a4: color-mix(in srgb, var(--my-brand-color) 20%, transparent) !important;
        --accent-5: color-mix(in srgb, var(--my-brand-color) 25%, white) !important;
        --accent-a5: color-mix(in srgb, var(--my-brand-color) 25%, transparent) !important;
        --accent-7: color-mix(in srgb, var(--my-brand-color) 60%, white) !important;
        --accent-a7: color-mix(in srgb, var(--my-brand-color) 60%, transparent) !important;
        --accent-8: color-mix(in srgb, var(--my-brand-color) 80%, white) !important;
        --accent-a8: color-mix(in srgb, var(--my-brand-color) 80%, transparent) !important;
        --accent-9: var(--my-brand-color) !important;
        --accent-a9: var(--my-brand-color) !important;
        --accent-10: color-mix(in srgb, var(--my-brand-color) 90%, black) !important;
        --accent-a10: color-mix(in srgb, var(--my-brand-color) 90%, transparent) !important;
        --accent-11: var(--my-brand-color) !important;
        --accent-a11: var(--my-brand-color) !important;
      }

      /* Принудительное переопределение состояний кнопок */
      .radix-themes .rt-Button[data-accent-color="indigo"]:active,
      .radix-themes button[data-accent-color="indigo"]:active {
        transform: none !important;
        scale: 1 !important;
      }

      /* Solid кнопки - active состояние */
      .radix-themes .rt-Button[data-accent-color="indigo"][data-variant="solid"]:active,
      .radix-themes button[data-accent-color="indigo"][data-variant="solid"]:active {
        background-color: color-mix(in srgb, ${radixTheme} 85%, black) !important;
        border-color: color-mix(in srgb, ${radixTheme} 85%, black) !important;
      }

      /* Soft кнопки - active состояние */
      .radix-themes .rt-Button[data-accent-color="indigo"][data-variant="soft"]:active,
      .radix-themes button[data-accent-color="indigo"][data-variant="soft"]:active {
        background-color: color-mix(in srgb, ${radixTheme} 25%, white) !important;
      }

      /* Outline кнопки - active состояние */
      .radix-themes .rt-Button[data-accent-color="indigo"][data-variant="outline"]:active,
      .radix-themes button[data-accent-color="indigo"][data-variant="outline"]:active {
        background-color: color-mix(in srgb, ${radixTheme} 20%, white) !important;
        border-color: color-mix(in srgb, ${radixTheme} 85%, white) !important;
      }

      /* Ghost кнопки - active состояние */
      .radix-themes .rt-Button[data-accent-color="indigo"][data-variant="ghost"]:active,
      .radix-themes button[data-accent-color="indigo"][data-variant="ghost"]:active {
        background-color: color-mix(in srgb, ${radixTheme} 20%, white) !important;
      }
    `;

    console.log('Applying custom Radix theme color:', radixTheme);
  }, [colors, radixTheme]);

  return (
    <Theme
      accentColor="indigo"
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
