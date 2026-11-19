const mes = require('@dict/message')
const { data: store } = require('@store')

function all(idB, obj) {
	const r = []
	// Формирование актуального списка пушей
	// Нет связи с модулями (обратитесь в техподдержку)
	const connect = obj.alarm?.banner?.connect?.[idB]
	if (connect) r.push(connect)

	// Сообщения из списка на странице сигналы
	obj.alarm.signal?.[idB]?.forEach((el) => {
		// Фильтр на аварию низкой температуры, если ее count=false
		if (el.code === 'alrClosed' && !el.count) return
		// Добавитиь аварийное сообщение в пуш если она из списка flt=[true]
		if (fnNeed().includes(el.msg)) r.push(el)
	})

	// Доп сообщения
	const h = fnHin(idB, obj)
	if (h.length) r.push(...h)

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

/**
 * Формируем сообщения для 1 или 2 пределов влажности
 * @param {*} idB ИД склада
 * @param {*} obj data.value
 * @returns {object[]}
 */
function fnHin(idB, obj) {
	// Настройка: отн. влажность продукта
	const mois = store.calcSetting[idB]?.mois
	// Верзняя граница владности продукта
	const humidityMax = 90
	// Текущая влажность продукта
	const hin = obj?.total?.[idB]?.hin?.max
	const humidity = [mois?.humidity, humidityMax]
	if (mois?.humidity >= humidityMax) humidity.pop()

	return humidity
		.map((h) => {
			if (hin <= h) return
			return { msg: `Влажность продукта ${hin}% больше влажности задания ${h}%` }
		})
		.filter(Boolean)
}
