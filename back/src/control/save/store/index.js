let { data: store, accDir } = require('@store')
const { writeSync } = require('@tool/json')
const { readOne } = require('@tool/json')

/**
 *
 * @param {*} obj
 */
async function writeStore() {
	// Первый цикл: инициализация аккумулятора
	// if (store._first) {
	// 	const s = await readOne('store.json', accDir)
	// 	store = s
	// 	return
	// }
	// const filename = 'store'
	// writeSync({ [filename]: store }, accDir, null)
}

module.exports = writeStore
