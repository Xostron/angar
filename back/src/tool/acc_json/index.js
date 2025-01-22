// Работа с аккумулятором json

/**
 * Записать
 * @param {object} acc аккумулятор json
 * @param {string} key extralrm
 * @param {object} data данные
 */
function writeAcc(acc, data, key = 'extralrm') {
	const { bldId, secId, code, mes } = data
	acc[key] ??= {}
	acc[key][bldId] ??= {}
	if (!secId) {
		acc[key][bldId][code] = mes
		return
	}
	acc[key][bldId][secId] ??= {}
	acc[key][bldId][secId][code] = mes
}

function removeAcc(acc, data, key = 'extralrm') {
	const { bldId, secId, code } = data
	if (!secId) {
		delete acc?.[key]?.[bldId]?.[code]
		return
	}
	delete acc?.[key]?.[bldId]?.[secId]?.[code]
}

function isExist(){

}

module.exports = { writeAcc, removeAcc, isExist }
