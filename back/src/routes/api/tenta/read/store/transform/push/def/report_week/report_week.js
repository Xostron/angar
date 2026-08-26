const { getParam, check, rejectedLog, getBhour, message } = require('./fn')
const { getWeek } = require('@tool/command/time')
const { getDb } = require('@tool/logger/db')
const { readAcc } = require('@store/index')
const { v4: uuidv4 } = require('uuid')

async function reportWeek(idB, section, obj) {
	try {
		const db = getDb()
		if (!db) return new Error('Недельный отчет отклонен. БД логов недоступна')
		// Создание аккумулятора недельного отчета
		const acc = readAcc(idB, 'building', 'reportWeek')
		// Проверка понедельник 8:00?
		if (!check(acc)) {
			return null
		}
		// Получить диапазон неделю
		const week = getWeek()

		// Сбор данных ЗА НЕДЕЛЮ
		// Температура продукта: текущая, мин, макс
		// Влажность продукта: текущая, мин, макс
		// Моточасы склада
		// Электроэнергия
		const r = await Promise.allSettled([
			getParam(db, idB, 'tprd', week, obj),
			getParam(db, idB, 'hin', week, obj),
			getBhour(db, idB, 'bhour', week, obj),
		])

		const rr = r.map((el) => (el.status == 'fulfilled' ? el.value : null))

		// Логи упавших запросов
		rejectedLog(r, idB)

		// Недельный отчет отправлен
		acc.done = true
		return {
			buildingId: idB,
			code: 'week',
			uid: uuidv4(),
			date: new Date().toLocaleString(),
			msg: message(rr),
		}
	} catch (error) {
		console.error(error)
		return null
	}
}

module.exports = reportWeek
