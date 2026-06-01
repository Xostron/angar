const { msgM } = require('@tool/message')
const { store } = require('@store/index')
const { compareTime } = require('@tool/time')

/**
 * Разрешение на чтение модуля
 * @param {*} idB Id склада
 * @param {*} idsM Id модуля
 * @param {*} ip IP модуля
 * @param {*} opt Конфигурация модуля
 * @returns {boolean} true - разрешить чтение модуля, false - блокировка на чтение
 */
function timeout(idsB, idsM, ip, opt) {
	if (!idsM.length) return true
	// Модуля нет в списке/еще не прошло время - разрешен
	if (!debMdl(idsB, idsM, opt)) return true

	// Модуль исправен - разрешен
	if (!isErrM2(idsB, idsM)) return true

	// Поставить неисправный модуль в ожидание повторного чтения
	// Время повторного чтения (1 мин)
	const repeat = (opt?.repeat ?? store.tTCP) * 60_000
	for (const idM of idsM) {
		if (!store.timeout?.[idM]) store.timeout[idM] = new Date()
		const t = compareTime(store.timeout[idM], repeat)
		// Время ожидания прошло - разрешить чтение
		if (store.timeout[idM] && t) {
			// Сбросить время
			store.timeout[idM] = new Date()
			// Время прошло - разрешить опрос
			console.log('📮 Время повторного чтения прошло - Разрешить опрос', ip, opt?.name)
			return true
		}
		// Время не прошло - блокировать опрос модуля
		console.log('⏳ Модуль заблокирован (ожидание повторного чтения)', opt?.name, opt?.use, ip)
		return false
	}
}

// Сохранить неисправный модуль сначала в антидребезг
function wrDebMdl(idsM) {
	idsM.forEach((idM) => {
		if (!store.debMdl?.[idM]) {
			store.debMdl[idM] = new Date()
		}
	})
}

// Удалить модуль из списка антидребезга
function delDebMdl(idsM) {
	if (!idsM || !idsM?.length) return (store.debMdl = {})
	idsM.forEach((idM) => {
		delete store.debMdl?.[idM]
	})
}

// Удалить модуль из списка неисправных
function delModule(idB, idM) {
	if (!idM || !idM?.length) {
		delete store.alarm.module?.[idB]
		return
	}
	idM.forEach((id) => delete store.alarm.module?.[idB]?.[id])
}

// Добавить модуль в список неисправных
function wrModule(idB, idM, o) {
	store.alarm.module ??= {}
	store.alarm.module[idB] ??= {}
	if (idM instanceof Array) {
		idM.forEach((id) => {
			if (!store.alarm.module[idB]?.[id]) store.alarm.module[idB][id] = o
		})
	} else {
		if (!store.alarm.module?.[idB]?.[idM]) store.alarm.module[idB][idM] = o
	}
}

/**
 * Антидребезг модуля
 * Когда чтение модуля происходит с ошибкой, модуль попадает в
 * промежуточный список "Антидребезга" на время store.tDeb, в течении данного времени
 * система будет пытаться читать данные (при успешном чтении модуль немедленно удаляется из
 * данного списка), если за это время модуль успешно не прочитается, то он попадает в
 * список "Неисправных модулей"
 * @param {*} idB
 * @param {string[]} idM Массив ИД модулей с одинаковым IP
 * @param {*} opt
 * @returns true - прошло время антидребезга - запрещен,
 * false - модуля нет в списке/еще не прошло время - разрешен
 */
function debMdl(idsB, idsM, opt) {
	// Если модуля нет в списке антидребезга - разрешен
	if (!idsM.some((id) => store.debMdl?.[id])) return false

	// Время антидребезга - время в течении, которого модуль будет считаться рабочим
	const debounce = (opt?.debounce ?? store.tDeb) * 60_000
	let flag = false
	for (const i in idsM) {
		const idM = idsM[i]
		const idB = idsB
		const t = compareTime(store.debMdl[idM], debounce)
		// Время прошло: авария осталась -> добавляем модуль в список неисправных
		if (store.debMdl[idM] && t) {
			flag = true
			wrModule(idB, idM, msgM(idB, opt, 110))
		}
	}
	if (flag) {
		console.log('👁️ Модуль неисправен', opt.ip, opt.name, )
		return true
	}

	// Модуль в списке антидребезга, время еще не прошло - разрешен
	return false
}

// Проверка внесен ли модуль в список неисправных
function isErrM(idB, idsM) {
	const arr = idsM instanceof Array ? idsM : [idsM]
	return arr.some((idM) => !!store.alarm?.module?.[idB]?.[idM])
}

// Проверка внесен ли модуль в список неисправных (использовать только при чтении модулей)
function isErrM2(idsB, idsM) {
	const arr = idsM instanceof Array ? idsM : [idsM]
	return arr.some((idM, i) => !!store.alarm?.module?.[idsB[i]]?.[idM])
}

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
module.exports = { wrDebMdl, delDebMdl, timeout, delModule, isErrM, isErrMs }
