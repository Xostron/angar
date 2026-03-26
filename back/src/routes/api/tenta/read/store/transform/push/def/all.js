const mes = require('@dict/message')

function all(idB, data) {
	const r = []
	// Формирование актуального списка пушей
	// Нет связи с модулями (обратитесь в техподдержку)
	const connect = data.alarm?.banner?.connect?.[idB]
	if (connect) r.push(connect)

	// Сообщения из списка на странице сигналы
	data.alarm.signal?.[idB]?.forEach((el) => {
		// Фильтр на аварию низкой температуры, если ее count=false
		if (el.code === 'alrClosed' && !el.count) return
		// Добавитиь аварийное сообщение в пуш если она из списка flt=[true]
		if (fnNeed().includes(el.msg)) r.push(el)
	})

	// console.log(5500, 'r', r)
	return r
}

module.exports = all

/**
 *
 * @returns Список всех сообщений для пушей flt[0] === true
 */
function fnNeed() {
	const need = Object.values(mes)
		.filter((el) => el.flt && el.flt[0] === true)
		.map((el) => el.msg)
	return need
}
