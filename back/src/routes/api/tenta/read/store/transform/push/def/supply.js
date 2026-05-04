const mes = require('@dict/message')

/**
 * Если есть "авария питания (ручной сброс)" ИЛИ Питание отключено,
 * то блокируем все пуши, кроме battery ИЛИ supply
 * @param {*} idB
 * @param {*} obj
 * @returns {object}
 */
function supply(idB, obj) {
	// total =
	// Авария питания. Ручной сброс || Авария питания (батарея)
	// Авария питания (сигнал): склад и секции

	// Если есть хоть одна авария по питанию, отправляем в пуш
	// одно единое сообщение, все остальные очищаем
	const total = [
		obj.alarm?.banner?.battery?.[idB],
		...Object.values(obj.alarm?.banner?.supply?.[idB] ?? {}),
	].some((el) => !!el)

	if (total) {
		const r = mes[38]
		r.msg = 'Авария питания'
		return r
	}
	return null
}

module.exports = supply
