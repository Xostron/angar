const mes = require('@dict/message')
const { data: store } = require('@store')
const { compareTime } = require('@tool/command/time')

/**
 * Если есть "авария питания (ручной сброс)" ИЛИ Питание отключено,
 * то блокируем все пуши, кроме аварии питания
 * @param {*} idB
 * @param {*} obj
 * @returns {object}
 */
function supply(idB, obj) {
	// Обнаружение аварии питания
	const total = [
		obj.alarm?.banner?.battery?.[idB],
		...Object.values(obj.alarm?.banner?.supply?.[idB] ?? {}),
	].some((el) => !!el)

	// Слежение за появлением-сбросом аварии
	upSupply(idB, total)
	downSupply(idB, total)
	const r = supplyTimeout(idB, total)
	// Авария только что сбросилась
	if (r) return r

	// Авария существует
	if (total) return fnMes()

	// Аварии питания нет
	return null
}

module.exports = supply

function fnMes(from, till) {
	const r = mes[38]
	// Если указан диапазон, то отобразить его в пуш сообщении
	const txt =
		from && till ? ` с ${from.toLocaleString('ru')} по ${till.toLocaleString('ru')}` : ''
	r.msg = 'Авария питания' + txt

	return r
}

/**
 * Регистрация появление аварии питания
 * @param {*} idB
 * @param {*} total
 */
function upSupply(idB, total) {
	if (total && !store?.retain?.[idB]?.upSupply) {
		store.retain ??= {}
		store.retain[idB] ??= {}
		store.retain[idB].upSupply = new Date()
	}
}

/**
 * Регистрация сброса аварии питания
 * @param {*} idB
 * @param {*} total
 */
function downSupply(idB, total) {
	if (!total && !store.retain?.[idB]?.downSupply && store?.retain?.[idB]?.upSupply) {
		store.retain ??= {}
		store.retain[idB] ??= {}
		store.retain[idB].downSupply = new Date()
	}
}

// 5 мин
const _TIME = 5 * 60 * 1000
/**
 * После сброса аварии питания, 5 мин игнорируем все появляющиеся аварии (не отправляем в пуши)
 * в пуш отправляем только одно сообщение "Авария питания с .. по .."
 * @returns
 */
function supplyTimeout(idB, total) {
	// Если нет времени появления/сброса аварии - выходим
	if (!store?.retain?.[idB]?.upSupply || !store?.retain?.[idB]?.downSupply) return

	// Если время появления/сброса аварии существует и снова появилась авариz питания
	//  в теччении 5 минут -> Сброс времени для перерегистрации
	if (total) return clear(idB)

	// Ожидание 5 мин
	const time = compareTime(store?.retain?.[idB]?.downSupply, _TIME)
	if (!time) return fnMes(store?.retain?.[idB]?.upSupply, store?.retain?.[idB]?.downSupply)
	// Время прошло, очистка времени и выкл игнора пуша
	clear(idB)

	return
}

function clear(idB) {
	store.retain[idB].upSupply = null
	store.retain[idB].downSupply = null
}
