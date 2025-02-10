import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: null
});

export const loadingState = atom({
  key: 'loadingState',
  default: true
});

export const toastState = atom({
  key: 'toastState',
  default: {
    message: '',
    type: '' // 'success' or 'error'
  }
}); 