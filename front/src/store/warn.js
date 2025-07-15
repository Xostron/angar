import { create } from 'zustand'

//Хранилище состояния предупреждений
const useWarn = create((set, get) => ({
	// Показать
	show: false,
	// Данные для формы
	data: {},
	// // link это история посещений, необходимо для срабатывания диалогового окна
	// если мы хотим покинуть текущую страницу
	link: {},
	// Код отображаемой модалки
	entryCode: null,
	/**
	 * Статические данные из def
	 * Записать данные и показать
	 * @param {*} code код предупреждения
	 * @param {*} fnYes Выполнение пользовательских функци - кнопка Да
	 * @param {*} fnNo кнопка Нет
	 */
	warn: (code, entryCode, fnYes, fnNo) => {
		const data = { ...def[code], fnYes, fnNo }
		set({ show: true, data, entryCode })
	},
	// Записать данные и показать, динамические данные
	warnCustom: (obj, entryCode) => {
		const data = { ...obj }
		set({ show: true, data, entryCode })
	},
	// Очистить данные и закрыть - кнопка Отмена
	clear: () => set({ show: false, data: {}, entryCode: null }),
	// Записать ссылки
	setLink(data) {
		if (!data) set({ link: {} })
		set({ link: { ...data } })
	},
}))

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
	save: {
		type: 'warn',
		title: `Сохранение`,
		text: `Сохранить настройки?`,
	},
}
