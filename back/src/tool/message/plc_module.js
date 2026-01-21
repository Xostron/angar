const { msgM } = require('@tool/message')
const { data: store } = require('@store')

/**
 * Разрешение на чтение модуля
 * @param {*} idB Id склада
 * @param {*} idM Id модуля
 * @param {*} ip IP модуля
 * @param {*} opt Конфигурация модуля
 * @returns {boolean} true - разрешить чтение модуля, false - блокировка на чтение
 */
function timeout(idB, idM, ip, opt) {
	if (!idB || !idM) return true
	// Проверка модуль находится в списке Антидребезга
	if (isDebMdl(idB, idM, opt)) return true
	// Модуль исправен - разрешить опрос
	if (!isErrM(idB, idM)) return true

	// Поставить неисправный модуль в ожидание повторного чтения
	// Время повторного чтения (1 мин)
	const repeat = (opt?.repeat ?? store.tTCP) * 60_000

	// if (opt.ip === '192.168.21.132') console.log('======repeat===========', repeat)
	const now = new Date().getTime()
	if (!store.timeout?.[idM]) store.timeout[idM] = now + repeat
	// Время не прошло - блокировать опрос модуля
	if (now <= store.timeout?.[idM]) {
		console.log('Блокировать модуль', opt?.name, opt?.use, ip)
		return false
	}
	store.timeout[idM] = new Date().getTime() + repeat
	console.log('Разрешить опрос', opt?.name, opt?.use, ip)
	// Время прошло - разрешить опрос
	return true
}

// Сохранить неисправный модуль сначала в антидребезг
function wrDebMdl(idM) {
	if (!store.debMdl?.[idM]) store.debMdl[idM] = new Date()
}

// Удалить модуль из списка антидребезга
function delDebMdl(idM = '') {
	if (!idM) store.debMdl = {}
	delete store.debMdl?.[idM]
}

// Удалить модуль из списка неисправных
function delModule(idB, idM) {
	if (!idM) {
		delete store.alarm.module?.[idB]
		return
	}
	delete store.alarm.module?.[idB]?.[idM]
}

// Проверка внесен ли модуль в список неисправных
function isErrM(idB, idM) {
	return !!store.alarm.module?.[idB]?.[idM]
}

// Есть ли неисправные модули в системе
/**
 * Поиск неисправных модулей, с игнорирование "внешних" модулей
 * Внешний модуль отмечается в админке, неисправность данных модулей
 * не влияет на работу склада
 * Два режима выполнения:
 * 1. Без рамы модулей: простая проверка, по наличию любых неисправных модулей
 * 2. С рамой: исключаем из списка неисправных модулей, модули отмеченные как "внешний"
 * @param {string} idB ИД склада
 * @param {object[]} mdl Рама модулей
 * @returns true - есть неисправные модули
 */
function isErrMs(idB, mdl = []) {
	// 1. Без рамы модулей: простая проверка, по наличию любых неисправных модулей
	if (!mdl) return Object.keys(store.alarm?.module?.[idB] ?? {}).length ? true : false
	// 2. С рамой: исключаем из списка неисправных модулей, модули отмеченные как "внешний"
	const aErr = Object.keys(store.alarm?.module?.[idB] ?? {}).filter((idM) => {
		const foreign = mdl.find((el) => el._id === idM)?.foreign
		return !foreign
	})
	return !!aErr?.length
}

// Добавить модуль в список неисправных
function wrModule(idB, idM, o) {
	store.alarm.module ??= {}
	store.alarm.module[idB] ??= {}
	if (!store.alarm.module[idB]?.[idM]) store.alarm.module[idB][idM] = o
}

/**
 * Антидребезг модуля
 * Когда чтение модуля происходит с ошибкой, модуль попадает в
 * промежуточный список "Антидребезга" на время store.tDeb, в течении данного времени
 * система будет пытаться читать данные (при успешном чтении модуль немедленно удаляется из
 * данного списка), если за это время модуль успешно не прочитается, то он попадает в
 * список "Неисправных модулей"
 * @param {*} idB
 * @param {*} idM
 * @param {*} opt
 * @returns
 */
function isDebMdl(idB, idM, opt) {
	// Если модуля нет в списке - выход
	if (!store.debMdl[idM]) return
	const debounce = (opt?.debounce ?? store.tDeb) * 60_000
	// if (opt.ip === '192.168.21.132') console.log('======debounce===========', debounce)
	const time = store.debMdl[idM].getTime() + debounce
	const cur = new Date().getTime()
	// Время прошло: авария осталась -> добавляем модуль в список неисправных
	if (cur >= time) {
		wrModule(idB, idM, msgM(idB, opt, 110))
		// Запрещаем читать модуль
		return false
	}
	// Разрешаем читать модуль
	return true
}

module.exports = { wrDebMdl, delDebMdl, timeout, delModule, isErrM, isErrMs }
