import { create } from 'zustand';

// Состояние для управления диалоговыми окнами
const useModalStore = create((set, get) => ({
  code: null, // Имя текущей модалки (строка)
  props: {}, // Переданные данные

  open: (code, props = {}) => set({ code: code, props: props }),

  close: () => set({ code: null, props: {} }),
}));

export default useModalStore;
