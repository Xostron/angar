const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')

async function retainStart(obj) {
	await createAndModifySync(obj, 'data', retainDir, cb)
}

/**
 *
 * @param {*} obj данные от web клиента {_id:buildId, value: true/false}
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	let result = data ? data : {}
	// Создать или сохранить изменения в json
	result = { ...result, [obj._id]: { ...result[obj._id], start: obj.val } }
	return result
}

module.exports = retainStart
