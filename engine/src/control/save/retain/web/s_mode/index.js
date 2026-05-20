/**
 * Режим секции
 * @param {*} acc данные от web клиента
 * @param {*} result данные из файла json
 */
function cb(acc, result) {
	for (const idB in acc) {
		if (idB==='name') continue
		for (const idS in acc[idB]) {
			result[idB].mode ??= {}
			result[idB].mode[idS] = acc[idB][idS]
		}
	}
}
module.exports = cb
