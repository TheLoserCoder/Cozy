export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  placeholder: string;
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: 'Поиск в Google...'
  },
  {
    id: 'yandex',
    name: 'Яндекс',
    url: 'https://yandex.ru/search/?text=',
    placeholder: 'Поиск в Яндексе...'
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholder: 'Поиск в Bing...'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    placeholder: 'Поиск в DuckDuckGo...'
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    placeholder: 'Поиск в Yahoo...'
  },
  {
    id: 'baidu',
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: 'Поиск в Baidu...'
  },
  {
    id: 'startpage',
    name: 'Startpage',
    url: 'https://www.startpage.com/sp/search?query=',
    placeholder: 'Поиск в Startpage...'
  },
  {
    id: 'searx',
    name: 'SearX',
    url: 'https://searx.org/?q=',
    placeholder: 'Поиск в SearX...'
  },
  {
    id: 'ecosia',
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    placeholder: 'Поиск в Ecosia...'
  },
  {
    id: 'brave',
    name: 'Brave Search',
    url: 'https://search.brave.com/search?q=',
    placeholder: 'Поиск в Brave...'
  }
];

export function getSearchEngine(id: string): SearchEngine {
  return SEARCH_ENGINES.find(engine => engine.id === id) || SEARCH_ENGINES[0];
}
