import { create } from 'zustand';

/**
 * Состояние для управления диалоговыми окнами
 * code Код активной модалки
 * props Данные для модалки
 * open Открыть окно
 * close Закрыть окно
 *
 * Опционально: для обратной связи с другими компонентами которые зависят
 * от того что модалки просто открыли посмотреть / либо открыли ради действия
 * isPassiveVisit: true - пользователь не совершал действий (по-умолчанию),
 * false - пользователь совершил действие
 * resetPassive: сброс данного флага
 */
const useModalStore = create((set, get) => ({
  code: null, // Имя текущей модалки (строка)
  props: {}, // Переданные данные
  isPassiveVisit: false,

  open: (code, props = {}) => set({ code: code, props: props }),

  // flag - true закрытие модалки без действий внутри нее (по-умолчанию)
  // false - закрытие модалки после действия пользователя
  close: (isPassiveVisit = true) =>
    set({ code: null, props: {}, isPassiveVisit }),

  resetPassive: () => set({ isPassiveVisit: false }),
}));

export default useModalStore;

//
