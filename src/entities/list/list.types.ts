export interface LinkListItem {
  id: string;
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  customColor?: string; // Индивидуальный цвет ссылки
  className?: string;
}

export interface LinkList {
  id: string;
  title: string;
  enabled?: boolean; // Включен ли список (по умолчанию true)
  customColor?: string; // Индивидуальный цвет заголовка списка
  customSeparatorColor?: string; // Индивидуальный цвет разделителя списка
  customLinkColor?: string; // Индивидуальный цвет ссылок в списке
  icon?: string; // Название иконки из @radix-ui/react-icons
  iconColor?: string; // Индивидуальный цвет иконки списка
  links: LinkListItem[];
}

// Типы для быстрых ссылок
export interface FastLink {
  id: string;
  url: string;
  title: string;
  iconUrl?: string;
  customTextColor?: string; // Индивидуальный цвет текста
  customBackdropColor?: string; // Индивидуальный цвет задника (внешний круг)
  customIconBackgroundColor?: string; // Индивидуальный цвет фона иконки (внутренний круг)
}

export interface FastLinkSettings {
  enabled: boolean; // Включены ли быстрые ссылки
  columns: number; // Количество колонок (2-12, по умолчанию 5)
  globalTextColor?: string; // Глобальный цвет текста заголовков
  globalBackdropColor?: string; // Глобальный цвет задника (внешний круг)
  globalIconBackgroundColor?: string; // Глобальный цвет фона иконки (внутренний круг)
}
