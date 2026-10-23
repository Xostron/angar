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
	// console.log(11, hold?.raw, v, idSens)
	// С датчиком все ОК:
	// 1. значение датчика в аккумуляторе hold отсутсвует,
	if (!hold) {
		// Очищаем время слежения за датчиком
		store.debounce[idSens] = {}
		// if (idSens == '69f9dd09c35ea05200898d03') console.log(11, hold?.raw, v)
		return v
	}
	// 2. Состояние датчика не аварийное
	if (v.state !== 'alarm' && v.raw !== 0 && v.raw !== null) {
		// Очищаем время слежения за датчиком
		store.debounce[idSens] = {}
		// if (idSens == '69f9dd09c35ea05200898d03') console.log(111, hold?.raw, v?.raw)
		return v
	}
	// 3.
	if (v.raw === 0 && hold.raw === null) {
		// Очищаем время слежения за датчиком
		store.debounce[idSens] = {}
		return v
	}

	// С датчиком что-то не так:
	// 1. Если v.raw===0 =>
	// => засекаем антидребезг, в течении этого времени выдаем прошлое значение hold
	// => по окночанию антидребезга выдаем реальное значение датчика

	// 2. Если датчик в аварии
	// => засекаем антидребезг, в течении этого времени выдаем прошлое значение hold
	// => по окночанию антидребезга выдаем аварию датчика
	store.debounce[idSens] ??= {}
	// Текущее время
	const now = +new Date().getTime()
	// Аккумулятор антидребезга
	const debounce = store.debounce[idSens]

	// Инициализируем конец антидребезга
	if (!debounce.end) {
		// Из системных настроек (по-умолчанию 15мин = 900000мс)
		const tDebounce = getDef(idB, retain, 'sys', 'debounce') ?? store.tDebounce
		debounce.end = +new Date().getTime() + tDebounce
	}

	// Проверка  время антидребезга истекло?
	if (now >= debounce.end) {
		delete debounce.end
		// Да - объявляем датчик в аварию
		// if (v.raw !== 0) {
		// v.raw = null
		// v.value = null
		// v.state = 'alarm'
		// }
		// if (idSens == '69f9dd09c35ea05200898d03') console.log(44, hold?.raw, v?.raw)
		return v
	}
	// Нет - выдаем старое значение датчика
	// if (idSens == '69f9dd09c35ea05200898d03') console.log(22, hold?.raw, v)
	return hold
}

function debDI(sig, value, equip, result) {
	// Разрешенные сигналы для антидребезга:
	// Низкая температура канала, переключатель на щите,
	// работа от генератора, перегрев кабеля, питание в норме
	const rel = ['low', 'local', 'gen', 'cable', 'supply']
	// Сигнал без проверки антидребезга + в первом цикле проверка отменяется
	if (!rel.includes(sig.type) || store._first) {
		result[sig._id] = value
		return
	}
	// Сигнал с проверкой антидребезга
	const idB = getBbySig(sig, equip)
	const hold = debounceDI(idB, sig, value, store.holdSensor?.[sig._id])
	result[sig._id] = hold === undefined ? value : hold
	// Обновляем прошлое значение
	store.holdSensor[sig._id] = hold
}

/**
 * Антидребезг аналоговых датчиков
 * @param {*} idB
 * @param {*} sig
 * @param {*} v Показание датчика
 * @param {*} last Прошлое значение
 * @return {} v | last
 */
function debounceDI(idB, sig, v, last) {
	// Очищаем ВРЕМЯ СЛЕЖЕНИЯ за датчиком и обновляем аккумулятор hold:
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
