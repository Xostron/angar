const { data: store } = require('@store')
const { compareTime } = require('@tool/command/time')
const { getBbySig } = require('@tool/get/building')
const { getDef } = require('@tool/retain/setting')

/**
 * Антидребезг аналоговых датчиков
 * @param {*} idSens
 * @param {*} v Показание датчика
 * @param {*} holdSensor Буфер успешных показаний датчиков
 * @param {*} doc данные по датчику
 */
function debounce(idB, idSens, v, hold, retain, doc) {
	// 1. значение датчика в аккумуляторе hold отсутсвует,
	// 2. Состояние датчика не аварийное
	// Очищаем время слежения за датчиком и обновляем аккумулятор hold:

	if (!hold || v.state !== 'alarm' ) {
		store.debounce[idSens] = {}
		if (!v.raw && !hold) return v
		return !v.raw ? hold : v
	}

	// Антидребезг (подсовываем значение из аккумулятора в течении времени антидребезга,
	// по истечению времени - устанавливаем датчик в аварию)
	const curr = +new Date().getTime()
	store.debounce[idSens] ??= {}
	const debounce = store.debounce[idSens]
	// Определяем промежуток времени
	if (!debounce.end) {
		// Из системных настроек (по-умолчанию 15мин = 900000мс)
		const tDebounce = getDef(idB, retain, 'sys', 'debounce') ?? store.tDebounce
		debounce.start = +new Date().getTime()
		debounce.end = +new Date().getTime() + tDebounce
	}
	// Время истекло (значение датчика так и осталось = 0)- выдаем аварию датчика
	if (curr >= debounce.end) {
		delete debounce.end
		delete debounce.start
		v.raw = null
		v.value = null
		v.state = 'alarm'
		return v
	}
	// Время не истекло - возврат старого значения
	return hold
}

function debDI(sig, value, equip, result) {
	// Разрешенные сигналы для антидребезга:
	// Низкая температура канала, переключатель на щите, 
	// работа от генератора, перегрев кабеля, питание в норме
	const rel = ['low', 'local', 'gen', 'cable', 'supply']
	if (!rel.includes(sig.type)) {
		// Сигнал без проверкаи антидребезга
		result[sig._id] = value
		return
	}
	// Сигнал с проверкой антидребезга
	const idB = getBbySig(sig, equip)
	const hold = debounceDI(idB, sig, value, store.holdSensor?.[sig._id])
	result[sig._id] = hold
	// Обновляем прошлое значение
	store.holdSensor[sig._id] = hold
	// console.log(7700, 'DEBDI', sig.type, value, hold, store.debounce[sig._id])
}

/**
 * Антидребезг аналоговых датчиков
 * @param {*} idB
 * @param {*} sig
 * @param {*} v Показание датчика
 * @param {*} last Прошлое значение
 */
function debounceDI(idB, sig, v, last) {
	// Очищаем время слежения за датчиком и обновляем аккумулятор hold:
	// 1. значение датчика в аккумуляторе hold отсутсвует,
	// 2. Новое показание равно прошлому
	if (v === last) {
		store.debounce[sig._id] = {}
		return v
	}
	// Новое показание не равно прошлому, делаем антидребезг
	// (подсовываем значение из аккумулятора в течении времени антидребезга
	const s = store.calcSetting?.[idB]
	const tDebounce = (s?.sys?.debdi ?? store.tDebdi) * 1000
	store.debounce[sig._id] ??= {}
	const debounce = store.debounce[sig._id]
	debounce.date ??= new Date()

	const time = compareTime(debounce.date, tDebounce)
	if (!time) {
		// Время антидребезга не прошо -> выдаем прошлое значение сигнала
		return last
	}
	// Время антидребезга прошло -> выдаем показание сигнала
	delete debounce?.date
	return v
}

module.exports = { debounce, debDI }

