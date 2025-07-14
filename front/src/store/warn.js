import { create } from 'zustand'

//Хранилище состояния предупреждений
const useWarn = create((set, get) => ({
	// Показать
	show: false,
	// Данные для формы
	data: {},
	// Ссылки
	link: {},
	/**
	 * Статические данные из def
	 * Записать данные и показать
	 * @param {*} code код предупреждения
	 * @param {*} fnYes Выполнение пользовательских функци - кнопка Да
	 * @param {*} fnNo кнопка Нет
	 */
	warn: (code, fnYes, fnNo) => {
		const data = { ...def[code], fnYes, fnNo }
		set({ show: true, data })
	},
	// Записать данные и показать, динамические данные
	warnCustom: (obj, fnYes, fnNo) => {
		const data = { ...obj, fnYes, fnNo }
		set({ show: true, data })
	},
	// Очистить данные и закрыть - кнопка Отмена
	cancel: () => set({ show: false, data: {} }),
	// Записать ссылки
	setLink(data) {
		if (!data) set({ link: {} })
		set({ link: { ...data } })
	},
}))

// link это история посещений, необходимо для срабатывания диалогового окна
// если мы хотим покинуть текущую страницу

export default useWarn

const def = {
	auth: {
		type: 'warn',
		title: 'Авторизация',
		text: 'Необходимо войти в систему',
		fnYes: null,
		fnNo: null,
	},
	logout: {
		type: 'warn',
		title: 'Выход из системы',
		text: 'Вы действительно хотите выйти из системы?',
	},
    setting:{
        type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
    },
    save:{
        type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
    }
}
