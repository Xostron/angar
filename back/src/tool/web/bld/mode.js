/**
 * Агрегация режима работы секций
 * @param {*} bld Склад
 * @param {*} ids Массив ИД секций
 * @returns {Array} mode
 * Вентилируемы и комби склад: (авто true, ручной false, выкл null|undefined) [true, 'Авто']
 * Холодильник - не имеет режима работы секций ['','']
 */
function fnMode(bld, ids, retain) {
	// Холодильник
	if (bld.type === 'cold') return ['', '']
	// Вентилируемый и комби склад
	// Авто
	const auto = ids.some((idS) => retain?.[bld?._id]?.mode?.[idS])
	if (auto) return [true, 'Авто']

	// Ручной
	const man = ids.some((idS) => retain?.[bld?._id]?.mode?.[idS] === false)
	if (man) return [false, 'Руч']

	// Выкл
	return [null, 'Выкл']
}

module.exports = { fnMode }
