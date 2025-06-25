export interface LinkListItem {
  id: string;
  url: string;
  title: string;
  iconUrl?: string;
  color?: string;
  className?: string;
}

export interface LinkList {
  id: string;
  title: string;
  links: LinkListItem[];
}
