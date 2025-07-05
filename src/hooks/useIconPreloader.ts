import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { preloadIcons } from '../utils/iconCache';

export const useIconPreloader = () => {
  const fastLinks = useAppSelector(state => state.fastLinks);
  const lists = useAppSelector(state => state.lists);

  useEffect(() => {
    const iconIds: string[] = [];
    
    fastLinks.forEach(link => {
      if (link.iconId && link.iconType === 'favicon') {
        iconIds.push(link.iconId);
      }
    });
    
    lists.forEach(list => {
      if (list.iconId) iconIds.push(list.iconId);
      list.links.forEach(link => {
        if (link.iconId && link.iconType === 'favicon') {
          iconIds.push(link.iconId);
        }
      });
    });
    
    if (iconIds.length > 0) {
      preloadIcons(iconIds);
    }
  }, [fastLinks, lists]);
};