const mes = require('@dict/message')

/**
 * Если есть "авария питания (ручной сброс)" ИЛИ Питание отключено,
 * то блокируем все пуши, кроме battery ИЛИ supply
 * @param {*} idB
 * @param {*} data
 * @param {*} list
 * @returns {} undefined | 0 - авариq нет, пуши формируются как обычно
 * >0 - авария питания, все пуши игнорируются кроме аварии питания
 */
function supply(idB, data) {
	// total =
	// Авария питания. Ручной сброс || Авария питания (батарея)
	// Авария питания (сигнал): склад и секции

	// Если есть хоть одна авария по питанию, отправляем в пуш
	// одно единое сообщение, все остальные очищаем
	const total = [
		data.alarm?.banner?.battery?.[idB],
		...Object.values(data.alarm?.banner?.supply?.[idB] ?? {}),
	].some((el) => !!el)

	if (total) {
		const r = mes[38]
		r.msg = 'Авария питания'
		return r
	}
}

module.exports = supply
