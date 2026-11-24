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
 * Сообщение: Влажность проудкта больше влажности задания.
 * Формируем сообщения для 1 или 2 пределов влажности
 * @param {*} idB ИД склада
 * @param {*} obj data.value
 * @returns {object[]}
 */
function fnHin(idB, obj) {
	// Аккумулятор push-сообщений для влажности
	store.acc[idB] ??= {}
	store.acc[idB].push ??= {}
	store.acc[idB].push.hin ??= []
	const acc = store.acc[idB].push

	// Верхняя граница влажности продукта
	const humidityMax = 90
	// Гистерезис, чтобы не срабатывало по 500раз
	const hysteresis = 5
	// Текущая влажность продукта
	const hin = obj?.total?.[idB]?.hin?.max

	const reason = [humidityMax]

	// Сообщения в данный момент
	const rr = reason
		.map((h) => {
			if (hin <= h) return
			return { msg: `Влажность продукта выше ${h}%` }
		})
		.filter(Boolean)

	// Если значение датчика упало ниже задания, то сообщений не будет
	// но если прошлое сообщение в аккумуляторе имеется, то
	// начинаем проверку гистерезиса
	if (acc.hin?.length != rr.length) {
		const hyst = reason
			.map((h) => {
				if (hin <= h - hysteresis) return
				return { msg: `Влажность продукта выше ${h}%` }
			})
			.filter(Boolean)
		// console.log(33, hyst)
		acc.hin = hyst
		return acc.hin
	}
	// Актуализируем прошлое значение
	acc.hin = rr
	return acc.hin
}

// /**
// TODO ВЕРСИЯ С 2мя уставками влажности
//  * Сообщение: Влажность проудкта больше влажности задания.
//  * Формируем сообщения для 1 или 2 пределов влажности
//  * @param {*} idB ИД склада
//  * @param {*} obj data.value
//  * @returns {object[]}
//  */
// function fnHin(idB, obj) {
// 	// Аккумулятор push-сообщений для влажности
// 	store.acc[idB] ??= {}
// 	store.acc[idB].push ??= {}
// 	store.acc[idB].push.hin ??= []
// 	const acc = store.acc[idB].push
// 	// Настройка: отн. влажность продукта
// 	const hum = store.calcSetting?.[idB]?.mois?.humidity ?? 90
// 	// Верхняя граница влажности продукта
// 	const humidityMax = 90
// 	// Гистерезис, чтобы не срабатывало по 500раз
// 	const hysteresis = 5
// 	// Текущая влажность продукта
// 	const hin = obj?.total?.[idB]?.hin?.max

// 	const reason = [hum, humidityMax]

// 	// Если задание влажности (1 УСТАВКА) больше НАШЕЙ УСТАВКИ
// 	// (2 УСТАВКА) = 90%, то не учитываем НАШУ УСТАВКУ
// 	if (hum >= humidityMax) reason.pop()

// 	// Сообщения в данный момент
// 	const rr = reason
// 		.map((h) => {
// 			if (hin <= h) return
// 			return { msg: `Влажность продукта больше влажности задания ${h}%` }
// 		})
// 		.filter(Boolean)

// 	// Если значение датчика упало ниже задания, то сообщений не будет
// 	// но если прошлое сообщение в аккумуляторе имеется, то
// 	// начинаем проверку гистерезиса
// 	if (acc.hin?.length != rr.length) {
// 		const hyst = reason
// 			.map((h) => {
// 				if (hin <= h - hysteresis) return
// 				return { msg: `Влажность продукта больше влажности задания ${h}%` }
// 			})
// 			.filter(Boolean)
// 		// console.log(33, hyst)
// 		acc.hin = hyst
// 		return acc.hin
// 	}
// 	// Актуализируем прошлое значение
// 	acc.hin = rr
// 	return acc.hin
// }
