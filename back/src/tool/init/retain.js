const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')

async function initRetain(equip) {
	const { building, product } = equip
	// Инициализация по-умолчанию (авторежим, продукт)
	if (!building) return
	for (const bld of building) {
		await createAndModifySync({ bld, product }, 'data', retainDir, cbInit)
	}
}

/**
 * @description Зафиксировать время вкл/выкл склада
 * @param {*} obj id склада
 * @param {*} data данные из retain файла
 */
function cbInit(obj, data) {
	const { bld, product } = obj
	const onion = product?.find((el) => el.code == 'onion')

	let result = data ? data : {}
	result[bld._id] ??= {}
	// Авторежим
	result[bld._id].automode ??= 'cooling'
	// Продукт
	result[bld._id].product ??= onion
	return result
}

module.exports = initRetain
