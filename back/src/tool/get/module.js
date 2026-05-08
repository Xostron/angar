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

module.exports = { getMdl, getId }
