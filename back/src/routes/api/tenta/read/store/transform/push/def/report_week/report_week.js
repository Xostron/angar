const { getWeek, fmtTime } = require('@tool/command/time')
const { getParam, check, rejectedLog } = require('./fn')
const { getDb } = require('@tool/logger/db')
const { readAcc } = require('@store/index')

async function reportWeek(idB, section, obj) {
	try {
		const db = getDb()
		if (!db) return new Error('Недельный отчет отклонен. БД логов недоступна')
		// Создание аккумулятора недельного отчета
		const acc = readAcc(idB, 'building', 'reportWeek')
		// Аккумулятор моточасов склада
		const accBuildHour = readAcc(idB, 'building', 'buildHour')
		// Проверка понедельник 8:00?
		if (!check(idB, acc)) return null

		// Получить диапазон неделю
		const week = getWeek()

		// Сбор данных ЗА НЕДЕЛЮ
		// Время работы склада
		const bHour = fmtTime((accBuildHour?.total ?? 0)/1000, 1)

		// Температура продукта: текущая, мин, макс
		// Влажность продукта: текущая, мин, макс
		// Моточасы склада
		// Электроэнергия
		const r = await Promise.allSettled([
			getParam(db, idB, 'tprd', week, obj),
			getParam(db, idB, 'hin', week, obj),
		])

		const [tprd, hin] = r.map((el) => (el.status == 'fulfilled' ? el.value : null))

		// Логи управших запросов
		rejectedLog(r, idB)

		console.log(123, bHour, tprd, hin)
		// Недельный отчет отправлен
		acc.done = true
		return ``
	} catch (error) {
		console.error(error)
		return null
	}
}

module.exports = reportWeek
