const { fill, cb } = require('./fn')
const { debugJson } = require('@tool/json')

/**
 * Преобразование в удобный формат настроек (calcSetting)
 * @param {*} bld
 * @param {*} obj
 * @returns
 */
function setting(bld, obj) {
	const { retain, factory } = obj
	const codeP = retain?.[bld._id]?.product?.code
	// список настроек склада
	const kind = bld?.kindList
	const r = {}

	// по настройкам склада
	for (const key of kind) {
		const isPrd = factory?.[key]?._prd
		fill(r, retain?.[bld._id]?.setting?.[key], factory?.[key], cb, key, codeP, isPrd)
	}
	// Готовые настройки на сервере (для проверки)
	// debugJson({ newnew: r }, ph.resolve(__dirname))

	return r
}

module.exports = setting
