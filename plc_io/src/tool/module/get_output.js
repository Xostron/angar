const write = require('@tool/plc/write')
const { store } = require('@store/index')

/**
 * Получить модули для записи рама+значения
 * @param {object[]} mdls Рама модуль+оборудование
 * @returns {object[]} Модули выходов: Рама модуль+оборудование+маска выходов
 */
function getOutput(mdls) {
	return mdls
		.filter((el) => el.use === 'rw' || el.use === 'w')
		.map((el) => {
			const value = new Array(el?.wr?.channel).fill(0)
			return { ...el, value }
		})
}

/**
 * Запись модулей
 * @param {object[]} mdls Рама модуль+оборудование
 * @returns 
 */
async function writeOut(mdls) {
	// Если связь в норме, то разрешаем запись
	if (!store.extralrm.live) return null

	// Запрет записи
	console.log('🔴 live - Нет связи с ангаром')
	const out = getOutput(mdls)
	// if (!out.length) return console.log('🔴 live - Нет рамы')
	// Запись модулей выхода
	await write(out)
	console.log('🔴 live - Отключение выходов')
	return true
}

module.exports = { getOutput, writeOut }
