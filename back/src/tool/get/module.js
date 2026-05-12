/**
 * Получить модуль
 * @param {*} mdls Массив модулей (модуль+equipment) без дубляжей
 * @param {*} idM ИД модуля
 * @returns Элемент расширенного модуля
 */
function getMdl(mdls, idM) {
	const mdl = mdls.find((el) => el._id.includes(idM))
	const id = getId(mdl?.ip, mdl?.slaveId)
	return { mdl, id }
}

function getId(ip, slaveId = '') {
	return ip + '.' + slaveId
}

/**
 * Проверка: есть ли значения у данного модуля idM
 * @param {object[]} output Глобальные данные рама+значение модулей выходов
 * @param {string} idM ИД модуля, который хотим проверить на валидность
 */
function hasOutput(output, idM) {
	const mdl = output.find((el) => el._id.includes(idM))
	return !!mdl?.value
}

module.exports = { getMdl, getId, hasOutput }
