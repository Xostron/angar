const msg = require('@dict/message')

/**
 * Если есть "авария питания (ручной сброс)" ИЛИ Питание отключено,
 * то блокируем все пуши, кроме battery ИЛИ supply
 * @param {*} idB
 * @param {*} data
 * @param {*} list
 * @returns {} undefined | 0 - авариq нет, пуши формируются как обычно
 * >0 - авария питания, все пуши игнорируются кроме аварии питания
 */
function fnBattery(idB, data) {
	const r = []
	const battery = data.alarm?.banner?.battery?.[idB]
	const supply = data.alarm?.banner?.supply?.[idB]
	if (battery) {
		r.push(battery)
		console.log(5500, 'r', r)
		return r?.length
	}
	if (supply) {
		r.push(supply)
		console.log(5500, 'r', r)
		return r?.length
	}
}

function find(idB, data) {
	const r = []
	// Формирование актуального списка пушей
	// Нет связи с модулями (обратитесь в техподдержку)
	const connect = data.alarm?.banner?.connect?.[idB]
	if (connect) r.push(connect)

	// Сообщения из списка на странице сигналы
	data.alarm.signal?.[idB]?.forEach((el) => {
		if (fnNeed().includes(el.msg)) r.push(el)
	})

	console.log(5500, 'r', r)
	return r
}

module.exports = { fnBattery, find }

/**
 *
 * @returns Список всех сообщений для пушей flt[0] === true
 */
function fnNeed() {
	const need = Object.values(msg)
		.filter((el) => el.flt && el.flt[0] === true)
		.map((el) => el.msg)
	return need
}
