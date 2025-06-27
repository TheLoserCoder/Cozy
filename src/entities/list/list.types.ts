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
