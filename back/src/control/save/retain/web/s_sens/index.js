/**
 * Датчики
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	for (idB in acc) {
		if (idB === 'name') continue
		for (const idSens in acc[idB]) {
			result[idB][idSens] ??= {}
			result[idB][idSens] = { ...result[idB][idSens], ...acc[idB][idSens] }
		}
	}
}
module.exports = cb
