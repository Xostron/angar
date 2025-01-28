const { data: store } = require('@store')
const tSens = require('@dict/sensor')
const { getDef } = require('@tool/retain/setting')
/**
 * Антидребезг аналоговых датчиков
 * @param {*} idSens
 * @param {*} v Показание датчика
 * @param {*} holdSensor Буфер успешных показаний датчиков
 * @param {*} doc данные по датчику
 */
function debounce(idB, idSens, v, hold, retain, doc) {
	// Очищаем время слежения за датчиком и обновляем аккумулятор hold:
	// - значение датчика в аккумуляторе hold отсутсвует,
	// - состояние датчика выкл или в аварии
	// - новое показание датчика !== 0 (т.е. нормальное)
	// - новое показание датчика = старому

	// if (!hold || v.state !== 'on' || v.raw !== 0 || (v.raw === hold?.raw && v.raw !== 0)) {
	// 	store.debounce[idSens] = {}
	// 	return null
	// }

	// Очищаем время слежения за датчиком и обновляем аккумулятор hold:
	if (!hold || v.state !== 'alarm') {
		store.debounce[idSens] = {}
		return null
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

module.exports = debounce
