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
  customColor?: string; // Индивидуальный цвет заголовка списка
  links: LinkListItem[];
}
