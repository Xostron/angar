import { create } from 'zustand'

// Состояние для управления диалоговыми окнами
const useWarnStore = create((set, get) => ({
	// Флаг - Показать entry (диалоговое окно)
	show: false,
	// Данные для entry
	data: {},
	// link это история посещений, необходимо для срабатывания диалогового окна, если мы хотим покинуть текущую страницу
	link: {},
	// Код отображаемой entry
	entryCode: null,
	/**
	 * Статические entry
	 * @param {string | object} code Данные для отображения: def[code](шаблоны)
	 * 								или object(пользовательские)
	 * @param {string} entryCode Код формы
	 * @param {function} fnYes кнопка Да - опционально, пользовательские функции
	 * @param {function} fnNo кнопка Нет - опционально, пользовательские функции
	 */
	warn: (code, entryCode, fnYes, fnNo) => {
		let data
		if (typeof code === 'string') data = { ...def[code], fnYes, fnNo }
		else data = { ...code, fnYes, fnNo }
		set({ show: true, data, entryCode })
	},

	// Очистить данные формы, выключить показ формы
	clear: () => set({ show: false, data: {}, entryCode: null }),
	// Записать ссылки
	setLink(data) {
		if (!data) set({ link: {} })
		set({ link: { ...data } })
	},
}))

export default useWarnStore

// Данные для отображения в шаблоне формы warn('save', 'warn')
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
	noexist_cooler: {
		type: 'warn',
		title: `Испаритель`,
		text: `Не найден испаритель ВНО, проверьте конфигурацию испарителя`,
	},
}
