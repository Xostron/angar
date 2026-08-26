const { fmtTime } = require('@tool/command/time')
const { find } = require('@tool/db')
const _HOUR = 8
/**
 * Разрешение отправки недельного отчета
 * @param {Object} acc
 * @returns {boolean} true - разрешено
 */
function check(acc) {
	// (0 — воскресенье, 1 — понедельник)
	// Сейчас понедельник
	const isMonday = new Date().getDay() === 1
	// Сейчас 8 утра
	const is8 = new Date().getHours() === _HOUR
	// const is8 = new Date().getHours() <= 17
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

/**
 * Получить с БД ангара значения с датчиков (Текущая, мин, макс)
 * @param {Object} db Ссылка на БД
 * @param {string} idB ИД склада
 * @param {string} type Коолекция и тип параметра
 * @param {Date[]} week Диапазон неделя с и по
 * @param {Object} obj Глобальный объект с данными
 * @returns {number[]} [cur, min, max]
 */
async function getParam(db, idB, type, range, obj) {
	try {
		// Срез значений
		let values = await find(db, 'sensor', {
			bldId: idB,
			type,
			ts: { $gte: range[0], $lte: range[1] },
		})
		// Оставляем только числовые значения
		values = values.map((el) => el?.value).filter((el) => typeof el == 'number')

		let min = Math.min(...values)
		if (min === Infinity || min === -Infinity) min = '--'

		let max = Math.max(...values)
		if (max === Infinity || max === -Infinity) max = '--'

		// Текущая, мин, макс
		return [obj?.total?.[idB]?.[type]?.min ?? '--', min, max]
	} catch (error) {
		console.error(error)
		throw error
	}
}

/**
 * Получить с БД ангара значения с датчиков (Текущая, мин, макс)
 * @param {Object} db Ссылка на БД
 * @param {string} idB ИД склада
 * @param {string} type Коолекция и тип параметра
 * @param {Date[]} week Диапазон неделя с и по
 * @param {Object} obj Глобальный объект с данными
 * @returns {number[]} [cur, min, max]
 */
async function getBhour(db, idB, type, range, obj) {
	try {
		// Срез значений
		const values = await find(
			db,
			'hour',
			{
				bldId: idB,
				type,
				ts: { $gte: range[0], $lte: range[1] },
			},
			{ ts: 1 },
		)

		if (!values.length) return '00ч 00м'

		// Вычисление моточасов за неделю
		const start = values.at()
		const end = values.at(-1)
		const v = (end.value - start.value) / 1000
		const r = fmtTime(v, 1)
		return r
	} catch (error) {
		console.error(error)
		throw error
	}
}

/**
 * Печатаем логи упавших запросов
 * @param {Object[]} r Результат запросов await Promise.allSettled
 * @param {string} idB
 */
function rejectedLog(r, idB) {
	const keys = ['tprd', 'hin']
	for (let i = 0; i < r.length; i++) {
		if (r[i].status === 'fulfilled') continue
		console.error(`Ошибка сбора ${keys[i]} для idB ${idB}:`, r[i].reason?.message)
	}
}

function message(r) {
	const [tprd, hin, bhour] = r
	const result = [`Время работы: ${bhour ? bhour : '--'}`]
	if (tprd) {
		result.push(
			`Температура продукта: тек = ${tprd[0]}°, мин = ${tprd[1]}°, макс = ${tprd[2]}°`,
		)
	}
	if (hin) {
		result.push(`Влажность продукта: тек = ${hin[0]}%, мин = ${hin[1]}%, макс = ${hin[2]}%`)
	}
	return result.join('\n')
}

module.exports = { check, getParam, rejectedLog, getBhour, message }
