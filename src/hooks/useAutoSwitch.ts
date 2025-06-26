import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { switchToRandomImage, setAutoSwitchLastDate } from '../store/backgroundSlice';

export const useAutoSwitch = () => {
  const dispatch = useAppDispatch();
  const { autoSwitch, images } = useAppSelector((state) => state.background);

  useEffect(() => {
    if (!autoSwitch.enabled || images.length <= 1) {
      return;
    }

    const handleAutoSwitch = () => {
      const today = new Date().toDateString();
      
      switch (autoSwitch.mode) {
        case 'onLoad':
          // Переключаем при каждой загрузке страницы
          dispatch(switchToRandomImage());
          break;
          
        case 'daily':
          // Переключаем раз в день
          if (autoSwitch.lastSwitchDate !== today) {
            dispatch(switchToRandomImage());
            dispatch(setAutoSwitchLastDate(today));
          }
          break;
      }
    };

    // Выполняем переключение при монтировании компонента
    handleAutoSwitch();
  }, [autoSwitch.enabled, autoSwitch.mode, autoSwitch.lastSwitchDate, images.length, dispatch]);
};
