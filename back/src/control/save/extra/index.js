let { data: store, accDir } = require('@store')
const { writeSync } = require('@tool/json')
const { readOne } = require('@tool/json')
const defExtra = require('@control/extra/extra/def')
const { readAcc } = require('@store/index')
/**
 * Промежуточные расчеты подпрограмм extra хранятся в store.acc
 * Прочитать конкретный аккумулятор, можно при помощи readAcc
 * Данная функция каждый цикл сохраняет аккумулятор в файл extra.json
 * и при первом запуске инициализирует аккумулятор данными из extra.json
 *
 * Это нужно для безударного перехода состояния склада при перезагрузке pos (полночь, обновление и т.д.)
 * @param {*} obj
 */
async function writeStore() {
	// Первый цикл: инициализация аккумулятора
	if (store._first) {
		const [acc, building, section] = await Promise.all([
			readOne('store.json', accDir),
			readOne('building'),
			readOne('section'),
		])

		if (!acc || !Object.keys(acc ?? {}).length)
			return console.log('Файл store.json пустой', acc)

		initExtra(acc, section)

		return
	}
	// Сохранение каждый цикл, кроме первого
	// Сохраняем только store.acc
	const filename = 'store'
	writeSync({ [filename]: store?.acc }, accDir, null)
}

module.exports = writeStore

// Список ращрешенных аккумуляторов
const extraCodes = ['vent', 'co2', 'coAuto', 'coOn']
/**
 * Инициализация аккумулятора store.acc по списку разрешенных аккумуляторов
 * @param {*} acc
 * @param {*} section
 */
function initExtra(acc, section) {
	for (const idB in acc) {
		const names = section.filter((sec) => sec.buildingId === idB).map((sec) => sec._id)
		names.push('building')
		for (const name in acc[idB]) {
			if (!names.includes(name)) continue
			for (const code in acc[idB][name]) {
				if (!extraCodes.includes(code)) continue
				store.acc ??= {}
				store.acc[idB] ??= {}
				store.acc[idB][name] ??= {}
				store.acc[idB][name][code] = acc[idB][name]?.[code] ?? {}
				console.log(
					11,
					code,
					'инициализирован',
					Object.values(acc[idB][name]?.[code] ?? {}),
				)
			}
		}
	}
}
