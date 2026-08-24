const { readAcc } = require('@store/index')
const { runTime } = require('@tool/command/time')
const { find } = require('@tool/db')
const { getDb } = require('@tool/logger/db')

async function reportWeek(idB, section, obj) {
	try {
		const db = getDb()
		if (!db) return new Error('Недельный отчет отклонен. БД логов недоступна')
		// Аккумулятор недельного отчета
		const acc = readAcc(idB, 'building', 'reportWeek')
		// Проверка понедельник 8:00?
		if (!check(idB, acc)) return null
		// Получить диапазон неделю
		const week = getWeek()

		// Сбор данных для отчета
		// Время работы склада
		let datestart = obj.retain?.[idB]?.datestart
		datestart = typeof datestart === 'string' ? new Date(datestart) : datestart
		datestart = runTime(datestart, 1)

		// Температура продукта: текущая, мин, макс
		const tprd = await getParam(db, idB, 'tprd', week, obj)

		// Влажность продукта: текущая, мин, макс
		const hin = await getParam(db, idB, 'hin', week, obj)

		// Электроэнергия

		// Недельный отчет отправлен
		acc.done = true
		console.log(123, datestart, tprd, hin)
		return ``
	} catch (error) {
		console.log(error)
		return null
	}
}

module.exports = reportWeek

/**
 * Разрешение отправки недельного отчета
 * @param {*} idB
 * @param {*} acc
 * @returns {boolean} true - разрешено
 */
function check(idB, acc) {
	// (0 — воскресенье, 1 — понедельник)
	// Сейчас понедельник
	const isMonday = new Date().getDay() === 1
	// Сейчас 8 утра
	const is8 = new Date().getHours() <= 17
	// Запрещено: не тот день и час
	if (!isMonday || !is8) {
		delete acc?.done
		return false
	}

	// Запрещено: Недельный отчет уже был отправлен
	if (acc.done) return false

	// Разрешено
	return true
}

// Получить диапазон с прошлого понедельника 8:00 - по сейчас понедельник 8:00
function getWeek() {
	const today8 = new Date()
	today8.setHours(8, 0, 0, 0)
	const lastMon8 = new Date(today8)
	lastMon8.setDate(today8.getDate() - 7)
	return { today8, lastMon8 }
}

async function getParam(db, idB, type, week, obj) {
	try {
		let values = await find(db, 'sensor', {
			bldId: idB,
			type,
			ts: { $gte: week.lastMon8, $lte: week.today8 },
		})
		values = values.map((el) => el?.value).filter((el) => typeof el == 'number')

		let min = Math.min(...values)
		if (min === Infinity) min = '--'

		let max = Math.max(...values)
		if (max === Infinity) max = '--'

		const cur = obj?.total?.[idB]?.[type]?.min ?? '--'

		return [cur, min, max]
	} catch (error) {
		console.error(error)
		throw error
	}
}
