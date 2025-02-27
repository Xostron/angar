const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')

async function retainStart(obj) {
	createAndModifySync(obj, 'data', retainDir, cb)
}

/**
 *
 * @param {*} obj данные от web клиента {_id:buildId, value: true/false}
 * @param {*} data данные из файла json
 */
function cb(obj, data) {
	let result = data ? data : {}
	// Создать или сохранить изменения в json
	if (obj.val === false) {
		obj.datestop = new Date()
		obj.datestart = null
	} else {
		obj.datestop = null
		obj.datestart = new Date()
	}
	result = { ...result, [obj._id]: { ...result[obj._id], start: obj.val, datestart:obj.datestart,datestop:obj.datestop } }
	return result
}

module.exports = retainStart
