import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Типизированные hooks для Redux
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
