export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  placeholderKey: string; // Ключ для перевода placeholder
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholderKey: 'search.searchInGoogle'
  },
  {
    id: 'yandex',
    name: 'Yandex',
    url: 'https://yandex.ru/search/?text=',
    placeholderKey: 'search.searchInYandex'
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholderKey: 'search.searchInBing'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    placeholderKey: 'search.searchInDuckDuckGo'
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    placeholderKey: 'search.searchInYahoo'
  },
  {
    id: 'baidu',
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    placeholderKey: 'search.searchInBaidu'
  },
  {
    id: 'startpage',
    name: 'Startpage',
    url: 'https://www.startpage.com/sp/search?query=',
    placeholderKey: 'search.searchInStartpage'
  },
  {
    id: 'searx',
    name: 'SearX',
    url: 'https://searx.org/?q=',
    placeholderKey: 'search.searchInSearX'
  },
  {
    id: 'ecosia',
    name: 'Ecosia',
    url: 'https://www.ecosia.org/search?q=',
    placeholderKey: 'search.searchInEcosia'
  },
  {
    id: 'brave',
    name: 'Brave Search',
    url: 'https://search.brave.com/search?q=',
    placeholderKey: 'search.searchInBrave'
  }
];

export function getSearchEngine(id: string): SearchEngine {
  return SEARCH_ENGINES.find(engine => engine.id === id) || SEARCH_ENGINES[0];
}
