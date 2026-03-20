let { data: store, accDir } = require('@store')
const { writeSync } = require('@tool/json')
const { readOne } = require('@tool/json')

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
		const s = await readOne('store.json', accDir)
		store = s
		return
	}
	const filename = 'store'
	writeSync({ [filename]: store }, accDir, null)
}

module.exports = writeStore
