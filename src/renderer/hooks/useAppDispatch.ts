import { useDispatch } from 'react-redux';
import { AppDispatch } from 'renderer/store';

export const useAppDispatch: () => AppDispatch = useDispatch;
