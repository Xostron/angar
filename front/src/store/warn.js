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
	 * Записать данные и показать
	 * @param {string} code код для data = def[code] данные для entry
	 * @param {string} entryCode код entry (компонент формы диалогового окна)
	 * @param {function} fnYes кнопка Да - опционально пользовательские функции
	 * @param {function} fnNo кнопка Нет - опционально
	 */
	warn: (code, entryCode, fnYes, fnNo) => {
		const data = { ...def[code], fnYes, fnNo }
		set({ show: true, data, entryCode })
	},
	/**
	 * Динамические entry
	 * @param {*} obj данные формы
	 * @param {*} entryCode код entry (компонент формы диалогового окна)
	 */
	warnCustom: (obj, entryCode) => {
		const data = { ...obj }
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

// Статические формы, статические формы отобраэаются на форме entryCode='warn'
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
